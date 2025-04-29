import { PageHeartbeatEvent, Endpoints, Intl, ItemDetailsHydrationService } from 'Roblox';
import { unmountComponentAtNode } from 'react-dom';
import { pageName, seoName } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import constants, { PageTransitionStatus } from './constants';

interface StaticComponentData {
  componentName: string;
  jsBundleTags: string[];
  cssBundleTags: string[];
  localizationBundleTags: string[];
  pageScriptBundleTag: string;
  backendData: Map<string, string>;
}

const catalogBundleIdRegex = /^\/(?:bundles|catalog)\/(\d+)/;

let routingDiv: HTMLElement;
let pathToComponents: Map<string, string>;
let pathRegexToComponents: [RegExp, string][];
let componentToData: Map<string, StaticComponentData[]>;
let loadedDataBundles: Set<string>;
let referralUrl: string;
let currentPath: string;
let currentComponent: string;
let transitionStartTimestamp: number;
let numTransitions = 0;

function shouldRefresh() {
  return numTransitions > 50;
}

function getCleanPath(path: string) {
  return Endpoints.removeUrlLocale(path).toLowerCase().replace(/\/$/, '');
}

function getTransitionDuration() {
  return Date.now() - transitionStartTimestamp;
}

function populateLoadedDataBundles() {
  // get all static component scripts that are directly under head or body (in layout)
  const layoutStaticComponentScripts = document.querySelectorAll(
    'head > script[data-bundlename], body > script[data-bundlename]'
  );
  loadedDataBundles = new Set<string>();
  layoutStaticComponentScripts.forEach(script => {
    const scriptElement = script as HTMLScriptElement;
    loadedDataBundles.add(scriptElement.dataset.bundlename!);
  });

  // get all dynamic localization scripts in routing div
  const dynamicLocalizationScripts = document.querySelectorAll(
    `#routing > script[data-bundlename^="${constants.DynamicLocalizationResourceScriptBundleNamePrefix}"]`
  );
  dynamicLocalizationScripts.forEach(script => {
    const scriptElement = script as HTMLScriptElement;
    loadedDataBundles.add(scriptElement.dataset.bundlename!);
  });
}

function readInitialWebAppData() {
  routingDiv = document.getElementById('routing')!;
  const pathToComponentsData = JSON.parse(routingDiv.dataset.pathtocomponent!) as Map<
    string,
    string
  >;
  const pathRegexToComponentsData = JSON.parse(routingDiv.dataset.pathregextocomponent!) as Map<
    string,
    string
  >;
  const staticContentData = JSON.parse(routingDiv.dataset.staticcomponentdata!) as Map<
    string,
    StaticComponentData
  >;
  pathToComponents = new Map(Object.entries(pathToComponentsData)) as Map<string, string>;
  pathRegexToComponents = Object.entries(pathRegexToComponentsData).map(([regexStr, component]) => {
    const regex = new RegExp(regexStr);
    return [regex, component];
  }) as [RegExp, string][];
  componentToData = new Map(Object.entries(staticContentData)) as Map<
    string,
    StaticComponentData[]
  >;
}

function cleanUrlForPageLoadEvent(url: string): string {
  if (!url) {
    return '';
  }
  const urlObj = new URL(url);
  urlObj.hash = '';
  return urlObj.href;
}

function sendPageLoadEvent() {
  const internalPageName = pageName.PageNameProvider.getInternalPageName();
  const pageUrl = cleanUrlForPageLoadEvent(window.location.href);
  const urlLocale = Endpoints.getPageUrlLocale();
  const effectiveLocale = new Intl().getRobloxLocale();
  const localTimestamp = new Date().toISOString();
  eventStreamService.sendEventWithTarget(eventStreamService.eventTypes.pageLoad, internalPageName, {
    url: pageUrl,
    urlloc: urlLocale,
    lt: localTimestamp,
    effloc: effectiveLocale.toLowerCase(),
    refurl: cleanUrlForPageLoadEvent(referralUrl)
  });
}

function sendPageEvent(status: string, error?: Error) {
  const internalPageName = pageName.PageNameProvider.getInternalPageName();
  const pageUrl = window.location.href;
  const localTimestamp = new Date().toISOString();
  const transitionDuration = getTransitionDuration();
  eventStreamService.sendEventWithTarget('web_page_routing', internalPageName, {
    url: pageUrl,
    lt: localTimestamp,
    'Page.TransitionTime': transitionDuration,
    'Page.TransitionStatus': status,
    'Page.TransitionError': error?.message ?? '',
    'Page.TransitionErrorDetails': error?.stack ?? ''
  });
  if (status === PageTransitionStatus.Success) {
    sendPageLoadEvent();
    PageHeartbeatEvent.Init([2, 8, 20, 60]);
  }
}

function catchTransitionError(error: any) {
  const errorObject = error instanceof Error ? error : new Error(String(error));
  sendPageEvent(PageTransitionStatus.Failure, errorObject);
}

async function getAllWebAppData() {
  const rawData = await fetch(Endpoints.getAbsoluteUrl(`/webapps/list`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  componentToData = new Map(Object.entries(await rawData.json()));
}

function loadScript(oldScript: HTMLScriptElement) {
  return new Promise<void>((resolve, reject) => {
    const bundleName = oldScript.dataset.bundlename!;
    if (bundleName.startsWith(constants.DynamicLocalizationResourceScriptBundleNamePrefix)) {
      if (loadedDataBundles.has(bundleName)) {
        oldScript.remove();
        resolve();
        return;
      }
      loadedDataBundles.add(bundleName);
    }

    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value);
    });
    newScript.onload = () => {
      resolve();
    };
    oldScript.remove();
    routingDiv.appendChild(newScript);
  });
}

/**
 * Renders static content components by dynamically injecting scripts, styles, and localization bundles into the `routing` Div.
 *
 * @param {StaticComponentData[]} staticComponentDataList - An array of data objects representing the static components to be rendered.
 *        Each object contains information about component name, script bundles, localization bundles, CSS bundles, and other tags.
 */
async function loadAndRenderStaticComponents(staticComponentDataList: StaticComponentData[]) {
  let routingDivContent: string[] = [];
  staticComponentDataList.forEach(staticComponentData => {
    if (loadedDataBundles.has(staticComponentData.componentName)) {
      return;
    }
    if (staticComponentData.pageScriptBundleTag) {
      routingDivContent.push(staticComponentData.pageScriptBundleTag);
    }
    routingDivContent = routingDivContent
      .concat(staticComponentData.localizationBundleTags)
      .concat(staticComponentData.jsBundleTags)
      .concat(staticComponentData.cssBundleTags);
  });
  routingDiv.innerHTML = routingDivContent.join('\n');

  const scripts = Array.from(routingDiv.querySelectorAll('script'));
  await scripts.reduce(async (promise, script) => {
    await promise;
    return loadScript(script);
  }, Promise.resolve());
}

async function handleItemDetailsSeoName() {
  const internalPageName = pageName.PageNameProvider.getInternalPageName();
  // exceptional case for catalog item and bundle detail pages
  if (internalPageName === 'CatalogItem' || internalPageName === 'BundleDetail') {
    const assetIdRegex = catalogBundleIdRegex.exec(getCleanPath(window.location.pathname));
    if (assetIdRegex) {
      const itemDetails = await ItemDetailsHydrationService.getItemDetails(
        [
          {
            id: parseInt(assetIdRegex[1], 10),
            itemType: internalPageName === 'CatalogItem' ? 'asset' : 'bundle'
          }
        ],
        false,
        true
      );
      if (itemDetails.length > 0) {
        const itemDetail = itemDetails[0];
        // replace the last part of the path with the seo name
        const newPath = `${window.location.pathname.substring(
          0,
          window.location.pathname.lastIndexOf('/')
        )}/${seoName.formatSeoName(itemDetail.collectibleItemDetails.name)}`;
        window.history.replaceState(window.history.state, '', newPath);
      }
    }
  }
}

/**
 * Updates the web application by switching from the current component to a new one.
 * This involves tearing down the current component, unmounting its DOM structure,
 * clearing content, and initializing the new component with its setup logic.
 *
 * @param component - The name of the new component to load.
 */
async function switchWebAppComponent(component: string) {
  const currentComponentSetupAndTeardownFuncs = constants.ComponentToSetupAndTeardownFuncs.get(
    currentComponent
  );
  if (currentComponentSetupAndTeardownFuncs) {
    currentComponentSetupAndTeardownFuncs.teardown();
  }
  const contentContainer = document.getElementById('content')!;
  unmountComponentAtNode(contentContainer);
  routingDiv.innerHTML = '';
  contentContainer.innerHTML = '';
  const data = componentToData.get(component)!;

  const newComponentSetupAndTeardownFunc = constants.ComponentToSetupAndTeardownFuncs.get(
    component
  );
  if (newComponentSetupAndTeardownFunc) {
    // last data bundle is the top level one (that could contains backend data)
    const { backendData } = data[data.length - 1];
    if (backendData) {
      const backendDataMap = new Map(Object.entries(backendData)) as Map<string, string>;
      newComponentSetupAndTeardownFunc.setup(backendDataMap);
    } else {
      newComponentSetupAndTeardownFunc.setup(new Map());
    }
  }

  currentComponent = component;
  await loadAndRenderStaticComponents(data);
  numTransitions += 1;
  await handleItemDetailsSeoName();
  sendPageEvent(PageTransitionStatus.Success);
}

function getParentAnchor(inputElement: HTMLElement): HTMLAnchorElement | null {
  let element: HTMLElement | null = inputElement;
  while (element !== null) {
    if (element.tagName === 'A') {
      return element as HTMLAnchorElement;
    }
    element = element.parentElement;
  }
  return null;
}

// TEMPORARY
// delete this section and related logic after internal page names are passed up from the backend
const pageNameMap = {
  '/home': 'Home',
  '/catalog': 'Catalog',
  '/charts': 'Games'
};
const pageRegexMap = { '/catalog': 'CatalogItem', '/bundles': 'BundleDetail' };

function getComponentForPath(path: string): string | null {
  const component = pathToComponents.get(path);
  if (component) {
    if (path in pageNameMap) {
      pageName.PageNameProvider.setInternalPageName(pageNameMap[path as keyof typeof pageNameMap]);
    }
    return component;
  }

  const match = pathRegexToComponents.find(([regex]) => regex.test(path));
  if (match) {
    const key = Object.keys(pageRegexMap).find(k => path.startsWith(k));
    if (key) {
      pageName.PageNameProvider.setInternalPageName(pageRegexMap[key as keyof typeof pageRegexMap]);
    }
    return match[1];
  }
  return null;
}

function interceptNavigationsOnClick(event: MouseEvent) {
  // ctrl key for windows, meta key for mac
  // shift key for new window, alt key for download
  if (shouldRefresh() || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }
  let component: string | null = null;
  try {
    transitionStartTimestamp = Date.now();
    const tag = getParentAnchor(event.target as HTMLElement);
    if (!tag || !tag.href) {
      return;
    }

    const url = new URL(tag.href);
    // only intercept when the href is exactly ending with the pathname, i.e. no query params or hashes
    if (
      url.origin !== window.location.origin ||
      (!url.href.endsWith(url.pathname) &&
        !(tag.closest('#header') !== null && getCleanPath(url.pathname) === '/catalog')) // exception for catalog in navigation header
    ) {
      return;
    }
    referralUrl = window.location.href;
    window.dispatchEvent(new Event('setSearchMenuClose'));
    const path = getCleanPath(url.pathname);
    component = getComponentForPath(path);
    if (!component) {
      return;
    }

    event.preventDefault();

    window.history.pushState({ referrer: referralUrl }, '', url.href);
    currentPath = path;
  } catch (error) {
    catchTransitionError(error);
    return;
  }
  switchWebAppComponent(component).catch(catchTransitionError);
}

function popstateListener(event: PopStateEvent) {
  let component: string | null = null;
  try {
    transitionStartTimestamp = Date.now();
    const path = getCleanPath(window.location.pathname);

    // very specific case for catalog, where we want to stop the popstate event if the query string is empty
    if (path === '/catalog' && currentPath === '/catalog' && window.location.search === '') {
      event.stopImmediatePropagation();
      return;
    }

    if (currentPath === path) {
      // specific case for charts, since it is using hash router which doesn't like to maintain the state
      if (path === '/charts') {
        window.history.replaceState({ referrer: referralUrl }, '');
      }
      return;
    }
    if (shouldRefresh()) {
      // hard refresh page
      window.location.reload();
      return;
    }
    currentPath = path;
    component = getComponentForPath(path);
    if (!component) {
      console.error('Component not found');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    referralUrl = event.state?.referrer as string;
  } catch (error) {
    catchTransitionError(error);
    return;
  }
  switchWebAppComponent(component).catch(catchTransitionError);
}

function externalNavigationListener(event: Event) {
  let component: string | null = null;
  try {
    transitionStartTimestamp = Date.now();
    const redirectUrl = ((event as CustomEvent).detail as { url: string }).url;
    const parsedUrl = new URL(redirectUrl);

    const path = getCleanPath(parsedUrl.pathname);
    component = getComponentForPath(path);
    if (!component || shouldRefresh()) {
      window.location.href = redirectUrl; // redirect normally
      return;
    }
    referralUrl = window.location.href;
    window.history.pushState({ referrer: referralUrl }, '', parsedUrl.href);
    currentPath = path;
  } catch (error) {
    catchTransitionError(error);
    return;
  }
  switchWebAppComponent(component).catch(catchTransitionError);
}

function setupInitialLoadReady() {
  readInitialWebAppData();
  populateLoadedDataBundles();
  constants.Setup();

  currentPath = getCleanPath(window.location.pathname);
  const component = getComponentForPath(currentPath);
  if (!component) {
    console.error('Component not found');
    return;
  }
  currentComponent = component;

  document.body.addEventListener('click', interceptNavigationsOnClick);
  window.addEventListener('popstate', popstateListener);
  window.addEventListener('externalNavigation', externalNavigationListener);

  // set up a timer to refresh all webapp data every 5 minutes
  setInterval(getAllWebAppData, constants.FiveMinutesInMilis);
}

function reset() {
  document.body.removeEventListener('click', interceptNavigationsOnClick);
  window.removeEventListener('popstate', popstateListener);
  window.removeEventListener('externalNavigation', externalNavigationListener);
}

export { setupInitialLoadReady, getAllWebAppData, reset };
