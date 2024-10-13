import { SHOW_BANNER, HIDE_BANNER } from '../actions/actionTypes';

export default (state, action) => {
  switch (action.type) {
    case SHOW_BANNER:
      return {
        bannerText: action.bannerText,
        bannerType: action.bannerType,
        showCloseButton: action.showCloseButton,
        showBanner: true
      };
    case HIDE_BANNER:
      return {
        ...state,
        showBanner: false
      };
    default:
      return state;
  }
};
