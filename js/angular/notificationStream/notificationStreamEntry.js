import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/notificationStream/notificationStream.scss';

// import stream indicator
import notificationStreamIconModule from '../notificationStreamIcon/notificationStreamIconModule';

// import stream body
import notificationStreamModule from './notificationStreamModule';

importFilesUnderPath(require.context('../notificationStreamIcon/directives/', true, /\.js$/));
importFilesUnderPath(require.context('../notificationStreamIcon/filters/', true, /\.js$/));

const templateContextForIcon = require.context('../notificationStreamIcon/', true, /\.html$/);

const templatesForIcon = templateCacheGenerator(
  angular,
  'notificationStreamIconHtmlTemplate',
  templateContextForIcon
);
// self manual initialization
angular.element(function() {
  angular.bootstrap('#notification-stream-icon-container', [notificationStreamIconModule.name]);
});

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./filters/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContextForBody = require.context('./', true, /\.html$/);

const templatesForBody = templateCacheGenerator(
  angular,
  'notificationStreamHtmlTemplate',
  templateContextForBody
);

// self manual initialization
angular.element(function() {
  angular.bootstrap('.notification-stream-base', [notificationStreamModule.name]);
});

export default { notificationStreamIconModule, notificationStreamModule };
