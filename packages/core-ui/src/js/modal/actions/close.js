import { makeActionCreator } from "@rbx/core-scripts/react";
import { CLOSE } from "./actionTypes";

export default makeActionCreator(CLOSE, "status");
