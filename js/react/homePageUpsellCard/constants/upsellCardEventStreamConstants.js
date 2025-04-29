import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const BUTTON_CLICK = 'buttonClick';

export const contactMethodPromptSections = {
  mandatory: 'mandatory'
};

export const contactMethodPromptOrigins = {
  homepage: 'homepage'
};

export const events = {
  cardShown: {
    name: 'cardShown',
    type: eventTypes.modalAction,
    params: {
      aType: 'shown'
    }
  },
  buttonClick: {
    name: 'buttonClick',
    type: BUTTON_CLICK,
    params: {}
  }
};
