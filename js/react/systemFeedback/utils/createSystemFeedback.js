import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import systemFeedbackComponentFactory from './systemFeedbackComponentFactory';
import systemFeedbackServiceFactory from './systemFeedbackServiceFactory';

const initialState = {
  bannerText: null,
  bannerType: null,
  showBanner: false,
  showCloseButton: false
};

const createSystemFeedback = () => {
  const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
  const [component, getOptions] = systemFeedbackComponentFactory.create(store);
  const service = systemFeedbackServiceFactory.create(store, getOptions);
  return [component, service];
};

export default createSystemFeedback;
