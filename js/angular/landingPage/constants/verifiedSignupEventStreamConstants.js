import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const CONTEXT = 'MultiverseSignupForm';
const BUTTON_CLICK = 'buttonClick';

const events = {
  DefaultVerifiedSignupOrigin: 'WebVerifiedSignup',

  emailFocused: {
    name: 'emailFocused',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      aType: 'focus',
      field: 'email'
    }
  },
  phoneFocused: {
    name: 'phoneFocused',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      aType: 'focus',
      field: 'phone'
    }
  },
  useEmail: {
    name: 'useEmail',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      aType: 'click',
      field: 'useEmail'
    }
  },
  usePhone: {
    name: 'usePhone',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      aType: 'click',
      field: 'usePhone'
    }
  },
  checkedTermsCheckbox: {
    name: 'signup-form-tos-checkbox',
    context: CONTEXT,
    type: BUTTON_CLICK,
    params: {
      btn: 'tos_checkbox',
      field: 'checked'
    }
  },
  uncheckedTermsCheckbox: {
    name: 'signup-form-tos-checkbox',
    context: CONTEXT,
    type: BUTTON_CLICK,
    params: {
      btn: 'tos_checkbox',
      field: 'unchecked'
    }
  },
  termsCheckboxErrorShown: {
    name: 'signup-form-tos-error',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      field: 'tosError'
    }
  },
  parentEmailForKoreaUnderage: {
    name: 'parentEmailForKoreaUnderage',
    context: CONTEXT,
    type: eventTypes.formInteraction,
    params: {
      field: 'parentEmail'
    }
  }
};

export { events as default };
