import angular from "angular";
import { importAll, templateCacheGenerator } from "@rbx/core-scripts/angular";

// import main scss file
import "@rbx/core-ui/styleGuide/styleGuide.scss";

// import main module definition.
import "./toast/toastModule";
import "./infiniteScroll/infiniteScrollModule";
import "./verticalMenu/verticalMenuModule";
import "./modal/modalModule";
import "./limitedIcon/limitedIconModule";

importAll(require.context("./toast/directives/", true, /\.js$/));
const toastTemplateContext = require.context("./toast/", true, /\.html$/);
templateCacheGenerator(angular, "toastHtmlTemplate", toastTemplateContext);

importAll(require.context("./infiniteScroll/directives/", true, /\.js$/));
importAll(require.context("./verticalMenu/directives/", true, /\.js$/));

importAll(require.context("./modal/constants", true, /\.js$/));
importAll(require.context("./modal/controllers", true, /\.js$/));
importAll(require.context("./modal/services", true, /\.js$/));
const modalTemplateContext = require.context("./modal/", true, /\.html$/);
templateCacheGenerator(angular, "modalHtmlTemplate", modalTemplateContext);

importAll(require.context("./limitedIcon/directives/", true, /\.js$/));
const limitedIconTemplateContext = require.context("./limitedIcon/", true, /\.html$/);
templateCacheGenerator(angular, "limitedIconTemplate", limitedIconTemplateContext);
