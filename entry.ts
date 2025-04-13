import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as webBlox from "@rbx/ui";

addExternal(["Roblox", "ui"], webBlox);

addLegacyExternal("WebBlox", webBlox);
