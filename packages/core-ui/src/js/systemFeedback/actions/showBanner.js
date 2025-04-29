import { makeActionCreator } from "@rbx/core-scripts/react";
import { SHOW_BANNER } from "./actionTypes";

export default makeActionCreator(SHOW_BANNER, "bannerText", "bannerType", "showCloseButton");
