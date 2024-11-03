import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/peopleList/peopleList.scss';

// import main module definition.
import peopleListModule from './peopleListModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

export const templates = templateCacheGenerator(angular, 'peopleListHtmlTemplateApp', templateContext);

// self manual initialization
if (angular.element('#people-list-container').hasClass('no-self-bootstrap')) {
  window.peopleList = peopleListModule;
}

export default peopleListModule;
