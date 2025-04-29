import { addExternal } from "@rbx/externals";
import * as reactUtil from "@rbx/core-scripts/react";
import * as ReactUtilities from "@rbx/core-scripts/legacy/react-utilities";

addExternal(["Roblox", "core-scripts", "react"], reactUtil);

addExternal("ReactUtilities", { ...ReactUtilities });
