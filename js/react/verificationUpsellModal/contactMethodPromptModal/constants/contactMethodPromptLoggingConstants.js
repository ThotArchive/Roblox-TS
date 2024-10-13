import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const CONTACT_METHOD_MODAL = 'contactMethodModal';

// eslint-disable-next-line import/prefer-default-export
export const events = {
  // shared events
  contactMethodPromptShown: {
    name: 'contactMethodPromptShown',
    type: eventTypes.modalAction,
    context: CONTACT_METHOD_MODAL,
    params: {
      aType: 'shown'
    }
  },
  contactMethodPromptDismissed: {
    name: 'contactMethodPromptDismissed',
    type: eventTypes.modalAction,
    context: CONTACT_METHOD_MODAL,
    params: {
      aType: 'dismissed'
    }
  },
  contactMethodPromptEmailClicked: {
    name: 'contactMethodPromptEmailClicked',
    type: eventTypes.buttonClick,
    context: CONTACT_METHOD_MODAL,
    params: {
      btn: 'email'
    }
  },
  contactMethodPromptPhoneClicked: {
    name: 'contactMethodPromptPhoneClicked',
    type: eventTypes.buttonClick,
    context: CONTACT_METHOD_MODAL,
    params: {
      btn: 'phone'
    }
  },
  contactMethodPromptSupportClicked: {
    name: 'contactMethodPromptSupportClicked',
    type: eventTypes.buttonClick,
    context: CONTACT_METHOD_MODAL,
    params: {
      btn: 'support'
    }
  },
  contactMethodPromptLogoutClicked: {
    name: 'contactMethodPromptLogoutClicked',
    type: eventTypes.buttonClick,
    context: CONTACT_METHOD_MODAL,
    params: {
      btn: 'logout'
    }
  }
};
