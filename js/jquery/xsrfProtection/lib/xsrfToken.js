import $ from 'jquery';
const xsrfRequestMethods = ["POST", "PUT", "DELETE", "PATCH"];
const allowedHosts = [".roblox.com", ".robloxlabs.com", ".roblox.qq.com"];
const sslPortSuffix = ":443";
let currentToken = "";
let tokenTimestamp = null;

const xsrfHeaderName = "X-CSRF-TOKEN";
const getUrlWithoutQueryString = url => url?.split('?')[0];

// WebForms pages already get XSRF protection through ViewStateUserKey
const isAspxWebForm = url => getUrlWithoutQueryString(url)?.toLowerCase().endsWith(".aspx");

// Used to ensure that CsrfToken input is only added to forms submitted to the same site
function requiresXsrf(httpMethod, url) {
    return xsrfRequestMethods.indexOf(httpMethod?.toUpperCase()) >= 0
        && isValidHost(url)
        && !isAspxWebForm(url);
};

// Only include XSRF tokens for requests to trusted Roblox domains
function isValidHost(url) {
    const host = getHost(url);
    return host === location.host
        || isHostInAllowList(host);
}

function isHostInAllowList(host) {
    for (var i = 0; i < allowedHosts.length; i++) {
        if (host.endsWith(allowedHosts[i])) {
            return true;
        }
    }
    return false;
}

function getHost(url) {
    const parser = document.createElement('a');
    parser.href = url;

    let parserHost = parser.host;
    if (parserHost.endsWith(sslPortSuffix)) {
        // In Internet Explorer the host property is suffixed with a port, even if the URL does not explicitly contain the port.
        parserHost = parserHost.substring(0, parserHost.length - sslPortSuffix.length);
    }
    
    return parserHost;
}

function setToken(token) {
    // Don't update token if null is passed in, to prevent one bad client from messing up the state.
    if (!token) {
        return;
    }

    currentToken = token;
    tokenTimestamp = new Date();
}

function getTokenTimestamp() {
    return tokenTimestamp;
}

function loadTokenFromMetaTag() {
    const metaTag = $("meta[name='csrf-token']");
    if (metaTag.length > 0) {
        currentToken = metaTag.data("token");

        const timestampValue = metaTag.data("timestamp");
        if (timestampValue) {
            tokenTimestamp = new Date(Date.parse(timestampValue));
        }
    }
}

function getToken() {
    if (currentToken === "") {
        loadTokenFromMetaTag();
    }

    return currentToken;
}

const xsrfToken = {
    setToken: setToken,
    getToken: getToken,
    requiresXsrf: requiresXsrf,
    getTokenTimestamp: getTokenTimestamp,
    xsrfHeaderName: xsrfHeaderName
};

export default xsrfToken;