import { defer } from 'core-utilities';
import open from '../actions/open';
import close from '../actions/close';
import STATUS from '../constants/status';

class ModalService {
  constructor(store) {
    this.deferred = null;
    this.settled = false;

    this.store = store;
  }

  open() {
    if (this.deferred && !this.settled) {
      this.deferred.reject();
    }

    this.deferred = defer();
    this.settled = false;
    this.store.dispatch(open());

    const unsubscribe = this.store.subscribe(() => {
      const { show, status } = this.store.getState();
      if (!show) {
        switch (status) {
          case STATUS.action:
            this.settled = true;
            this.deferred.resolve();
            break;
          case STATUS.neutral:
            this.settled = true;
            this.deferred.reject();
            break;
          default:
            break;
        }
      }
      unsubscribe();
    });

    // Mute unhandled rejection exception
    const { promise } = this.deferred;
    promise.catch(() => {});
    return promise;
  }

  close() {
    this.store.dispatch(close());
  }
}

const create = store => new ModalService(store);

export default { create };
