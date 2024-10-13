import ROUTER_TYPES from './routerTypes';

const sharedProps = {
  basename: 'basename',
  getUserConfirmation: 'getUserConfirmation'
};

export default {
  [ROUTER_TYPES.Browser]: {
    forceRefresh: 'forceRefresh',
    keyLength: 'keyLength',
    ...sharedProps
  },
  [ROUTER_TYPES.Hash]: { hashType: 'hashType', ...sharedProps }
};
