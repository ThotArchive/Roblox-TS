import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

//import main module definition.
import contactsModule from './contactsModule';

importFilesUnderPath(require.context('./controllers/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

let contactsTemplateContext = require.context('./', true, /\.html$/);

templateCacheGenerator(angular, 'contactsAppTemplates', contactsTemplateContext); 