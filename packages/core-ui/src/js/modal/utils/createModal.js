import { createStore } from "redux";
import rootReducer from "../reducers";
import modalComponentFactory from "./modalComponentFactory";
import modalServiceFactory from "./modalServiceFactory";
import STATUS from "../constants/status";

const initialState = { show: false, status: STATUS.none };

const createModal = () => {
  const store = createStore(rootReducer, initialState);
  const component = modalComponentFactory.create(store);
  const service = modalServiceFactory.create(store);
  return [component, service];
};

export default createModal;
