import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const VERIFICATION_UPSELL = 'verificationUpsell';

const events = {
  showModal: {
    name: 'showModal',
    type: eventTypes.modalAction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'shown'
    }
  },
  dismissModal: {
    name: 'dismissModal',
    type: eventTypes.modalAction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'dismissed'
    }
  },
  touchEmail: {
    name: 'touchEmail',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'focus',
      field: 'email'
    }
  },
  showError: {
    name: 'showError',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'shown',
      field: 'errorMessage'
    }
  },
  clickContinue: {
    name: 'clickContinue',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      btn: 'continue'
    }
  },
  clickSendConfirmationEmail: {
    name: 'clickSendConfirmationEmail',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'click',
      btn: 'sendConfirmation'
    }
  },
  clickResendConfirmationEmail: {
    name: 'clickResendConfirmationEmail',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'click',
      btn: 'resendConfirmation'
    }
  },
  clickChangeEmail: {
    name: 'clickChangeEmail',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'click',
      btn: 'changeEmail'
    }
  },
  skipLogoutAnyway: {
    name: 'skipLogoutAnyway',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'click',
      btn: 'skipLogoutAnyway'
    }
  },
  skipPrepurchaseVerification: {
    name: 'skipPrepurchaseVerification',
    type: eventTypes.formInteraction,
    context: VERIFICATION_UPSELL,
    params: {
      aType: 'click',
      btn: 'skipPrepurchaseVerification'
    }
  }
};

export { events as default };
