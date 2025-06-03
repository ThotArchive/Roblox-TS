import { escapeHtml } from "@rbx/core-scripts/format/string";
import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const escape = () => escapeHtml;

angularJsUtilitiesModule.filter("escapeHtml", escape);
export default escape;
