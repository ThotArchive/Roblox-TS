import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as xsrfToken from "@rbx/core-scripts/auth/xsrfToken";
import xsrfTokenHeaderInjector from "./src/xsrfTokenHeaderInjector";
import xsrfTokenFormInjector from "./src/xsrfTokenFormInjector";

addExternal(["Roblox", "core-scripts", "auth", "xsrfToken"], xsrfToken);

addLegacyExternal(["Roblox", "XsrfToken"], xsrfToken);

// `xsrfTokenFormInjector` is not used in code in web-frontend, so there's no need to register a
// rspack external. But, it still needs to be assigned to window for other scripts loaded by backend.
addLegacyExternal(["Roblox", "XsrfTokenFormInjector"], xsrfTokenFormInjector);

// Header injector is initialized by default to maintain parity with the behavior of the old XsrfToken.js
xsrfTokenHeaderInjector.initialize();
