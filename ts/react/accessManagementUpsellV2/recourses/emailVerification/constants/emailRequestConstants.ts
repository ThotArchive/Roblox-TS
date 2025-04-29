import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;

// TODO: refactor how context is passed
const ID_VERIFICATION = 'ageVerification';

const emailRequestConstants = {
  emailRegex: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
  translationKeys: {
    addEmailToAccountKeys: {
      btnText: 'Action.Continue',
      ActionChangeEmail: 'Action.ChangeEmail',
      ActionSent: 'Action.Sent',
      ActionContinue: 'Action.Continue',
      ActionGenericSkip: 'Action.GenericSkip',
      DescriptionAddEmailTextOver13: 'Description.IDVerificationAddEmailText',
      DescriptionAddEmailTextUnder13: 'Description.IDVerificationAddEmailText',
      HeadingAddEmail: 'Heading.AddEmail',
      LabelEmailInputPlaceholderOver13: 'Label.EmailInputPlaceholderOver13',
      LabelEmailInputPlaceholderUnder13: 'Label.EmailInputPlaceholderUnder13',
      MessageInvalidEmailAddress: 'Message.InvalidEmailAddress'
    }
  },
  events: {
    showAddEmailModal: {
      name: 'showAddEmailModal',
      type: eventTypes.modalAction,
      context: ID_VERIFICATION,
      params: {
        aType: 'shown',
        field: 'addEmail'
      }
    },
    useAddEmailField: {
      name: 'useAddEmailField',
      type: eventTypes.formInteraction,
      context: ID_VERIFICATION,
      params: {
        btn: 'emailAddress',
        field: 'addEmail'
      }
    },
    addEmailConfirm: {
      name: 'addEmailConfirm',
      type: eventTypes.buttonClick,
      context: ID_VERIFICATION,
      params: {
        btn: 'continue',
        field: 'addEmail'
      }
    }
  }
};

export default emailRequestConstants;
