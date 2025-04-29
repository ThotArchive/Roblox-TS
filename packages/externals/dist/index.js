export const externals = {
    "@rbx/core-scripts/auth/bound-auth": ["Roblox", "core-scripts", "auth", "boundAuth"],
    "@rbx/core-scripts/auth/crypto": ["Roblox", "core-scripts", "auth", "crypto"],
    "@rbx/core-scripts/auth/fido2": ["Roblox", "core-scripts", "auth", "fido2"],
    "@rbx/core-scripts/auth/hba": ["Roblox", "core-scripts", "auth", "hba"],
    "@rbx/core-scripts/auth/hybrid-response": ["Roblox", "core-scripts", "auth", "hybridResponse"],
    "@rbx/core-scripts/auth/sai": ["Roblox", "core-scripts", "auth", "sai"],
    "@rbx/core-scripts/auth/xsrfToken": ["Roblox", "core-scripts", "auth", "xsrfToken"],
    "@rbx/core-scripts/data-store": ["Roblox", "core-scripts", "dataStore"],
    "@rbx/core-scripts/deep-link": ["Roblox", "core-scripts", "deepLink"],
    "@rbx/environment-urls": ["Roblox", "core-scripts", "environmentUrls"],
    "@rbx/core-scripts/entity-url": ["Roblox", "core-scripts", "entityUrl"],
    "@rbx/core-scripts/endpoints": ["Roblox", "core-scripts", "endpoints"],
    "@rbx/core-scripts/event-stream": ["Roblox", "core-scripts", "eventStream"],
    "@rbx/core-scripts/format/number": ["Roblox", "core-scripts", "format", "number"],
    "@rbx/core-scripts/format/string": ["Roblox", "core-scripts", "format", "string"],
    "@rbx/core-scripts/game": ["Roblox", "core-scripts", "game"],
    "@rbx/core-scripts/hybrid": ["Roblox", "core-scripts", "hybrid"],
    "@rbx/core-scripts/intl": ["Roblox", "core-scripts", "intl", "intl"],
    "@rbx/core-scripts/intl/translation": ["Roblox", "core-scripts", "intl", "translation"],
    "@rbx/core-scripts/http": ["Roblox", "core-scripts", "http", "http"],
    "@rbx/core-scripts/http/util": ["Roblox", "core-scripts", "http", "util"],
    "@rbx/core-scripts/legacy/core-utilities": "CoreUtilities",
    "@rbx/core-scripts/legacy/core-roblox-utilities": "CoreRobloxUtilities",
    "@rbx/core-scripts/legacy/header-scripts": "HeaderScripts",
    "@rbx/core-scripts/legacy/react-utilities": "ReactUtilities",
    "@rbx/core-scripts/local-storage": ["Roblox", "core-scripts", "localStorage", "localStorage"],
    "@rbx/core-scripts/local-storage/keys": ["Roblox", "core-scripts", "localStorage", "keys"],
    "@rbx/core-scripts/meta/device": ["Roblox", "core-scripts", "meta", "device"],
    "@rbx/core-scripts/meta/environment": ["Roblox", "core-scripts", "meta", "environment"],
    "@rbx/core-scripts/meta/user": ["Roblox", "core-scripts", "meta", "user"],
    "@rbx/core-scripts/metrics": ["Roblox", "core-scripts", "metrics"],
    "@rbx/core-scripts/payments-flow": ["Roblox", "core-scripts", "paymentsFlow"],
    "@rbx/core-scripts/react": ["Roblox", "core-scripts", "react"],
    "@rbx/core-scripts/realtime": ["Roblox", "core-scripts", "realtime"],
    "@rbx/core-scripts/tracing": ["Roblox", "core-scripts", "tracing"],
    "@rbx/core-scripts/util/accessibility": ["Roblox", "core-scripts", "util", "accessibility"],
    "@rbx/core-scripts/util/batch-request": ["Roblox", "core-scripts", "util", "batchRequest"],
    "@rbx/core-scripts/util/chat": ["Roblox", "core-scripts", "util", "chat"],
    "@rbx/core-scripts/util/cross-tab-communication": [
        "Roblox",
        "core-scripts",
        "util",
        "crossTabCommunication",
    ],
    "@rbx/core-scripts/util/current-browser": ["Roblox", "core-scripts", "util", "currentBrowser"],
    "@rbx/core-scripts/util/cursor-pagination": [
        "Roblox",
        "core-scripts",
        "util",
        "cursorPagination",
    ],
    "@rbx/core-scripts/util/date": ["Roblox", "core-scripts", "util", "date"],
    "@rbx/core-scripts/util/defer": ["Roblox", "core-scripts", "util", "defer"],
    "@rbx/core-scripts/util/element-visibility": [
        "Roblox",
        "core-scripts",
        "util",
        "elementVisibility",
    ],
    "@rbx/core-scripts/util/page-name": ["Roblox", "core-scripts", "util", "pageName"],
    "@rbx/core-scripts/util/ready": ["Roblox", "core-scripts", "util", "ready"],
    "@rbx/core-scripts/util/upsell": ["Roblox", "core-scripts", "util", "upsell"],
    "@rbx/core-scripts/util/url": ["Roblox", "core-scripts", "util", "url"],
    "@rbx/core-scripts/util/user": ["Roblox", "core-scripts", "util", "user"],
    "@rbx/core-ui": "ReactStyleGuide",
    "@rbx/core-ui/legacy/react-style-guide": "ReactStyleGuide",
    "@rbx/ui": ["Roblox", "ui"],
    angular: "angular",
    jquery: "jQuery",
    react: "React",
    "react/jsx-runtime": "ReactJSX",
    "react-dom": "ReactDOM",
    "react-dom/server": "ReactDOMServer",
    "react-redux": "ReactRedux",
    "react-router": "ReactRouter",
    "react-router-dom": "ReactRouterDOM",
    redux: "Redux",
    "redux-thunk": "ReduxThunk",
    "prop-types": "PropTypes",
};
export const addLegacyExternal = (key, external, 
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
target = window) => {
    if (typeof key === "string") {
        // eslint-disable-next-line no-param-reassign
        target[key] = external;
    }
    else {
        const keys = [...key];
        // `key` has at least one element because of its type
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const last = keys.pop();
        let obj = target;
        for (const k of keys) {
            obj[k] ??= {};
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            obj = obj[k];
        }
        obj[last] = external;
    }
};
export const addExternal = (key, external) => {
    addLegacyExternal(key, external);
};
export const checkLegacyExternalExists = (key) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    let obj = window;
    if (typeof key === "string") {
        return obj[key] != null;
    }
    for (const k of key) {
        const next = obj[k];
        if (next == null) {
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        obj = next;
    }
    return true;
};
export const checkExternalExists = (key) => checkLegacyExternalExists(key);
