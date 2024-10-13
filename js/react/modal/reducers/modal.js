import { OPEN, CLOSE } from '../actions/actionTypes';
import STATUS from '../constants/status';

export default (state, action) => {
  switch (action.type) {
    case OPEN:
      return {
        show: true,
        status: STATUS.none
      };
    case CLOSE:
      return {
        show: false,
        status: action.status
      };
    default:
      return state;
  }
};
