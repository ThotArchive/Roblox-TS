const FACEBOOK_SUNSET_CARD = 'facebookSunsetCard';
const HOMEPAGE = 'homepage';

const events = {
  setPasswordButtonClick: {
    name: 'setPassword',
    type: 'buttonClick',
    context: FACEBOOK_SUNSET_CARD,
    params: {
      btn: 'setPassword'
    },
    origin: HOMEPAGE
  },
  setPasswordSuccess: {
    name: 'setPasswordSuccess',
    type: 'passwordSet',
    context: FACEBOOK_SUNSET_CARD,
    params: {},
    origin: HOMEPAGE
  }
};

export { events as default };
