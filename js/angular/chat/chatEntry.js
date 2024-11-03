import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import '../../../css/chat/chat.scss';

// import main module definition.
import chatModule from './chatModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const chatTemplateContext = require.context('./', true, /\.html$/);

const templates = templateCacheGenerator(angular, 'chatAppTemplates', chatTemplateContext);

// self manual initialization
angular.element(function() {
  angular.element("#chat-container").hide();
  angular.bootstrap('#chat-container', [chatModule.name, templates.name]);
});
