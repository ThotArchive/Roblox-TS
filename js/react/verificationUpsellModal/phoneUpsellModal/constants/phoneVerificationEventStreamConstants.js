import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const VERIFICATION_UPSELL = 'verificationUpsell';
const events = {
  // shared events
  phoneNumberModalDismissed: {
    name: 'phoneNumberModalDismissed',
    type: eventTypes.modalAction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'dismissed'
    }
  },
  phoneNumberModalShown: {
    name: 'phoneNumberModalShown',
    type: eventTypes.modalAction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'shown'
    }
  },
  phoneNumberModalErrorShown: {
    name: 'phoneNumberModalErrorShown',
    type: eventTypes.modalAction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'shown',
      field: 'errorMessage'
    }
  },

  // page specific events
  addPhonePrefixPressed: {
    name: 'addPhonePrefixPressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'focus',
      field: 'countryPrefix'
    }
  },
  addPhonePhoneNumberPressed: {
    name: 'addPhonePhoneNumberPressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'focus',
      field: 'phoneNumber'
    }
  },
  addPhoneContinuePressed: {
    name: 'addPhoneContinuePressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'continue'
    }
  },
  verifyPhoneChangePhoneNumberPressed: {
    name: 'verifyPhoneChangePhoneNumberPressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'changePhoneNumber'
    }
  },
  verifyPhoneCodeFieldPressed: {
    name: 'verifyPhoneCodeFieldPressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'focus',
      field: 'verificationCode'
    }
  },
  verifyPhoneContinuePressed: {
    name: 'verifyPhoneContinuePressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'continue'
    }
  },
  verifyPhoneResendPressed: {
    name: 'verifyPhoneResendPressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'resendCode'
    }
  },
  phoneAddedDonePressed: {
    name: 'phoneAddedDonePressed',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'done'
    }
  }
};

export { events as default };
