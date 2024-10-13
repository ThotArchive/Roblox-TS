import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/landing/landing.scss'; // New SCSS
import '../../../css/landing/signup.scss'; // New SCSS
import '../../../css/landing/landingPage.scss';

// import main module definition.
import landingPageModule from './landingPageModule';

// Landing
importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);
const templates = templateCacheGenerator(angular, 'landingPageAppTemplates', templateContext);

// self manual initialization
angular.element(function () {
  angular.bootstrap('#landing-page-container', [landingPageModule.name, templates.name]); //
});

export default landingPageModule;
