import angularJsUtilitiesModule from '../angularJsUtilitiesModule';
import { escapeHtml } from 'core-utilities';

angularJsUtilitiesModule.filter('escapeHtml', escapeHtml);
export default escapeHtml;
