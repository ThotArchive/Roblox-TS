import { importFilesUnderPath } from 'roblox-es6-migration-helper';
import intlUtilsModule from './intlUtilsModule';

importFilesUnderPath(require.context('./filters/', true, /\.js$/));
importFilesUnderPath(require.context('./providers/', true, /\.js$/));
