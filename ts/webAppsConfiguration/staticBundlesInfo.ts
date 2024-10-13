function findAllBundleScripts() {
  // JS
  const allScripts: HTMLScriptElement[] = <HTMLScriptElement[]>(
    Array.prototype.slice.call(document.scripts)
  );
  const allBundles: HTMLScriptElement[] = allScripts.filter(script => {
    return script?.dataset && script?.dataset?.bundlename;
  });
  return allBundles;
}

const getAllBundleNames = (): Record<string, DOMStringMap> => {
  const allBundleScripts: HTMLScriptElement[] = findAllBundleScripts();
  const allBundles: Record<string, DOMStringMap> = {};
  allBundleScripts.map(bundleScript => {
    const { bundlename, bundleSource, bundleContext } = bundleScript.dataset;
    allBundles[bundlename] = {
      bundleSource: bundleSource === 'Main' ? 'Master Build' : `${bundleSource} Build`,
      bundleContext: bundleContext ?? ''
    };
    return false;
  });
  return allBundles;
};

const findBundleStatus = (
  bundleNames: string | string[]
): DOMStringMap | string | (string | DOMStringMap)[] => {
  if (bundleNames) {
    const allBundleInfo = getAllBundleNames();
    if (typeof bundleNames === 'string') {
      return allBundleInfo[bundleNames] ?? `${bundleNames} is not found`;
    }
    if (Array.isArray(bundleNames)) {
      return bundleNames.map(bundleName => {
        return allBundleInfo[bundleName] ?? `${bundleName} is not found`;
      });
    }
  }

  return `Expect valid argument inside findBundleStatus, either single string name or array of names`;
};

const readme =
  'Master build means the official deployed build from admin site in the current environment; \n\n Validation Build means the current build is only deployed for validation (VPN users will see only); \n\n Development build is the resource from Engineer local build, depend on which AD setup in to cookie, check ConfigureWebApps.getADFromCookie(); \n\n Unknown Build might be translation string bundle or invalid ';

export default {
  getAllBundleNames,
  findBundleStatus,
  readme
};
