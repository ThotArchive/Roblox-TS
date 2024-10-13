import { makeActionCreator } from 'react-utilities';
import { CLOSE } from './actionTypes';

export default makeActionCreator(CLOSE, 'status');
