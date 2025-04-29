import $ from "jquery";

// Do not import anything here without considering if you need to update the rspack.config.js

const xsrfRequestMethods = ["POST", "PUT", "DELETE", "PATCH"];
const allowedHosts = [".roblox.com", ".robloxlabs.com", ".roblox.qq.com"];
const sslPortSuffix = ":443";
let currentToken = "";
let tokenTimestamp: Date | null = null;

const xsrfHeaderName = "X-CSRF-TOKEN";

const getUrlWithoutQueryString = (url: string | undefined): string | undefined =>
  url?.split("?")[0];

// WebForms pages already get XSRF protection through ViewStateUserKey
const isAspxWebForm = (url: string | undefined): boolean | undefined =>
  getUrlWithoutQueryString(url)?.toLowerCase().endsWith(".aspx");

const getHost = (url: string) => {
  const parser = document.createElement("a");
  parser.href = url;

  let parserHost = parser.host;
  if (parserHost.endsWith(sslPortSuffix)) {
    // In Internet Explorer the host property is suffixed with a port, even if the URL does not explicitly contain the port.
    parserHost = parserHost.substring(0, parserHost.length - sslPortSuffix.length);
  }

  return parserHost;
};

const isHostInAllowList = (host: string) =>
  allowedHosts.some(allowedHost => host.endsWith(allowedHost));

// Only include XSRF tokens for requests to trusted Roblox domains
const isValidHost = (url: string) => {
  const host = getHost(url);
  return host === window.location.host || isHostInAllowList(host);
};

// Used to ensure that CsrfToken input is only added to forms submitted to the same site
const requiresXsrf = (httpMethod: string | undefined, url: string): boolean =>
  // @ts-expect-error TODO: old, migrated code
  xsrfRequestMethods.includes(httpMethod?.toUpperCase()) && isValidHost(url) && !isAspxWebForm(url);

const setToken = (token?: string): void => {
  // Don't update token if null is passed in, to prevent one bad client from messing up the state.
  if (!token) {
    return;
  }

  currentToken = token;
  tokenTimestamp = new Date();
};

const getTokenTimestamp = (): Date | null => tokenTimestamp;

const loadTokenFromMetaTag = () => {
  const metaTag = $("meta[name='csrf-token']");
  if (metaTag.length > 0) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    currentToken = metaTag.data("token");

    const timestampValue: unknown = metaTag.data("timestamp");
    if (timestampValue) {
      // @ts-expect-error TODO: old, migrated code
      tokenTimestamp = new Date(Date.parse(timestampValue));
    }
  }
};

const getToken = (): string => {
  if (currentToken === "") {
    loadTokenFromMetaTag();
  }
  return currentToken;
};

export { setToken, getToken, requiresXsrf, getTokenTimestamp, xsrfHeaderName };
