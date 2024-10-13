import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const eventContexts = {
  localization: 'Localization'
};

export default {
  changeLanguage: {
    name: 'changeLanguage',
    type: eventTypes.formInteraction,
    context: eventContexts.localization,
    requiredParams: ['userId', 'newSupportedLocaleCode', 'previousSupportedLocaleCode']
  },
  changeLanguageModal: {
    name: 'changeLanguageModal',
    type: eventTypes.formInteraction,
    context: eventContexts.localization,
    requiredParams: ['userId', 'newSupportedLocaleCode']
  }
};
