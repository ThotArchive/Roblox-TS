import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

// import main scss file
import '../../../css/styleGuide/styleGuide.scss';

// import main module definition.
import toastModule from '../toast/toastModule';

import infiniteScrollModule from '../infiniteScroll/infiniteScrollModule';

import verticalMenuModule from '../verticalMenu/verticalMenuModule';

import modalModule from '../modal/modalModule';

import limitedIconModule from '../limitedIcon/limitedIconModule';

importFilesUnderPath(require.context('../toast/directives/', true, /\.js$/));
const toastTemplateContext = require.context('../toast/', true, /\.html$/);
templateCacheGenerator(angular, 'toastHtmlTemplate', toastTemplateContext);

importFilesUnderPath(require.context('../infiniteScroll/directives/', true, /\.js$/));
importFilesUnderPath(require.context('../verticalMenu/directives/', true, /\.js$/));

importFilesUnderPath(require.context('../modal/constants', true, /\.js$/));
importFilesUnderPath(require.context('../modal/controllers', true, /\.js$/));
importFilesUnderPath(require.context('../modal/services', true, /\.js$/));
const modalTemplateContext = require.context('../modal/', true, /\.html$/);
templateCacheGenerator(angular, 'modalHtmlTemplate', modalTemplateContext);

importFilesUnderPath(require.context('../limitedIcon/directives/', true, /\.js$/));
const limitedIconTemplateContext = require.context('../limitedIcon/', true, /\.html$/);
templateCacheGenerator(angular, 'limitedIconTemplate', limitedIconTemplateContext);
