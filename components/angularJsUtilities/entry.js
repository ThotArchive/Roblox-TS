import angular from "angular";
import { importAll, templateCacheGenerator } from "@rbx/core-scripts/angular";
import "./src/angularJsUtilitiesModule";

importAll(require.context("./src/constants/", true, /\.js$/));
importAll(require.context("./src/directives/", true, /\.js$/));
importAll(require.context("./src/filters/", true, /\.js$/));
importAll(require.context("./src/services/", true, /\.js$/));

const templateContext = require.context("./src", true, /\.html$/);

templateCacheGenerator(angular, "angularjsUtilitiesTemplates", templateContext);
