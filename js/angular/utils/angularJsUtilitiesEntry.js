import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';

import angularJsUtilitiesModule from './angularJsUtilitiesModule';

importFilesUnderPath(require.context('./constants/', true, /\.js$/));
importFilesUnderPath(require.context('./directives/', true, /\.js$/));
importFilesUnderPath(require.context('./filters/', true, /\.js$/));
importFilesUnderPath(require.context('./services/', true, /\.js$/));

const templateContext = require.context('./', true, /\.html$/);

templateCacheGenerator(angular, 'angularjsUtilitiesTemplates', templateContext);
