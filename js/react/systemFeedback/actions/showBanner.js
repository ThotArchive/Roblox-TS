import { makeActionCreator } from 'react-utilities';
import { SHOW_BANNER } from './actionTypes';

export default makeActionCreator(SHOW_BANNER, 'bannerText', 'bannerType', 'showCloseButton');
