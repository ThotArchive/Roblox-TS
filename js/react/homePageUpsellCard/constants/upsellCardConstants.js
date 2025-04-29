import { FacebookSunsetService, UpsellService } from 'Roblox';
import { optUserInToVoiceChat } from '../services/optInVoiceService';

// TODO @wlu as the entropy of upsell card types increase, we should move over
// to having a render function that takes in an interface where relevant parameters
// are passed in, rather than being defined in this file of constants.
const UpsellCardType = {
  ContactMethodEmail: 'ContactMethodEmail',
  ContactMethodPhoneNumber: 'ContactMethodPhoneNumber',
  ContactMethodPhoneNumberVoiceOptIn: 'ContactMethodPhoneNumberVoiceOptIn',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'ContactMethodPhoneNumberEmailHorizontalLayout',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1:
    'ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1',
  ContactMethodPhoneNumberEmailVerticalLayout: 'ContactMethodPhoneNumberEmailVerticalLayout',
  FacebookSunset: 'FacebookSunset',
  ContactMethodMandatoryEmailPhone: 'ContactMethodMandatoryEmailPhone'
};

const UpsellCardTitle = {
  ContactMethodEmail: 'Label.DontGetLockedOut',
  ContactMethodPhoneNumber: 'Label.DontGetLockedOut',
  ContactMethodPhoneNumberVoiceOptIn: 'Header.UnlockVoiceChat',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'Label.DontGetLockedOut',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1: 'Heading.FinishAccountSetup',
  ContactMethodPhoneNumberEmailVerticalLayout: 'Label.DontGetLockedOut',
  FacebookSunset: ''
};

const UpsellCardContent = {
  ContactMethodEmail: 'Description.HomePageUpsellCardAddEmailText',
  ContactMethodPhoneNumber: 'Description.HomePageUpsellCardAddPhoneText',
  ContactMethodPhoneNumberVoiceOptIn: 'Description.UnlockVoiceChat.3',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'Label.RecoverYourAccount',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1: 'Description.ContactMethodAccessLoss',
  ContactMethodPhoneNumberEmailVerticalLayout: 'Label.RecoverYourAccount',
  FacebookSunset: 'Description.FacebookSetPasswordUpsellText'
};

const UpsellCardEventContext = {
  ContactMethodEmail: 'homePageUpsellCard',
  ContactMethodPhoneNumber: 'homePageUpsellCard',
  ContactMethodPhoneNumberVoiceOptIn: 'homePageUpsellCard',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'homePageUpsellCard',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1: 'homePageUpsellCard',
  ContactMethodPhoneNumberEmailVerticalLayout: 'homePageUpsellCard',
  FacebookSunset: 'facebookSunsetCard'
};

const UpsellCardEventSection = {
  ContactMethodEmail: 'email',
  ContactMethodPhoneNumber: 'phone',
  ContactMethodPhoneNumberVoiceOptIn: 'phone',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'emailOrPhone',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1: 'emailOrPhone',
  ContactMethodPhoneNumberEmailVerticalLayout: 'emailOrPhone',
  FacebookSunset: 'facebook'
};

const UpsellCardButtonOrientations = {
  vertical: 'vertical',
  horizontal: 'horizontal'
};

const getUpsellCardButtonGroup = (cardType, requireExplicitVoiceConsent) => {
  switch (cardType) {
    case 'ContactMethodEmail':
      return {
        primaryButton: {
          text: 'Action.AddEmail',
          onClick: UpsellService?.renderEmailUpsell,
          buttonClickBtnLog: 'email'
        }
      };
    case 'ContactMethodPhoneNumber':
      return {
        primaryButton: {
          text: 'Action.AddPhone',
          onClick: UpsellService?.renderPhoneUpsell,
          buttonClickBtnLog: 'phone'
        }
      };
    case 'ContactMethodPhoneNumberVoiceOptIn':
      return {
        primaryButton: {
          text: 'Action.AddPhone',
          onClick: props =>
            UpsellService?.renderPhoneUpsell({
              addPhoneAlwaysShowLegalText: true,
              addPhoneRequireLegalTextCheckbox: requireExplicitVoiceConsent,
              addPhoneHeadingKey: 'Action.AddPhoneVoice',
              addPhoneDescriptionKey: 'Description.AddPhoneBodyVoice',
              addPhoneButtonKey: 'Action.EnableVoice',
              addPhoneLegalTextKey: requireExplicitVoiceConsent
                ? 'Description.VoiceLegalConsent'
                : 'Description.VoiceLegalDisclaimer',
              beforeSuccess: async () => {
                try {
                  const success = (await optUserInToVoiceChat(true, false))?.isUserOptIn;
                  return success
                    ? ['Heading.VoiceChatEnabled', 'Description.CanNowJoinVoice']
                    : ['Heading.PhoneIsVerified', 'Description.TurnOnVoiceChat'];
                } catch (error) {
                  return ['Heading.PhoneIsVerified', 'Description.TurnOnVoiceChat'];
                }
              },
              ...props
            }),
          buttonClickBtnLog: 'phone'
        }
      };
    case 'ContactMethodPhoneNumberEmailHorizontalLayout':
      return {
        primaryButton: {
          text: 'Action.AddPhoneShort',
          onClick: UpsellService?.renderPhoneUpsell,
          buttonClickBtnLog: 'phone'
        },
        secondaryButton: {
          text: 'Action.AddEmail',
          onClick: UpsellService?.renderEmailUpsell,
          buttonClickBtnLog: 'email'
        },
        buttonStackOrientation: UpsellCardButtonOrientations.horizontal
      };
    case 'ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1':
      return {
        primaryButton: {
          text: 'Action.AddPhoneShort',
          onClick: UpsellService?.renderPhoneUpsell,
          buttonClickBtnLog: 'phone'
        },
        secondaryButton: {
          text: 'Action.AddEmail',
          onClick: UpsellService?.renderEmailUpsell,
          buttonClickBtnLog: 'email'
        },
        buttonStackOrientation: UpsellCardButtonOrientations.horizontal
      };
    case 'ContactMethodPhoneNumberEmailVerticalLayout':
      return {
        primaryButton: {
          text: 'Action.AddPhone',
          onClick: UpsellService?.renderPhoneUpsell,
          buttonClickBtnLog: 'phone'
        },
        secondaryButton: {
          text: 'Action.AddEmailAddress',
          onClick: UpsellService?.renderEmailUpsell,
          buttonClickBtnLog: 'email'
        },
        buttonStackOrientation: UpsellCardButtonOrientations.vertical
      };
    case 'FacebookSunset':
      return {
        primaryButton: {
          text: 'Action.SetPassword',
          onClick: FacebookSunsetService?.openFacebookSunsetModal,
          buttonClickBtnLog: 'setPassword'
        }
      };
    default:
      return null;
  }
};

const UpsellCardImageClass = {
  ContactMethodEmail: 'upsell-card-lock-icon-image',
  ContactMethodPhoneNumber: 'upsell-card-lock-icon-image',
  ContactMethodPhoneNumberVoiceOptIn: 'icon-voice-mic-unmuted',
  ContactMethodPhoneNumberEmailHorizontalLayout: 'upsell-card-lock-icon-image',
  ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1: 'upsell-card-lock-icon-image',
  ContactMethodPhoneNumberEmailVerticalLayout: 'upsell-card-lock-icon-image',
  FacebookSunset: ''
};

export {
  UpsellCardType,
  UpsellCardContent,
  UpsellCardTitle,
  UpsellCardEventContext,
  UpsellCardEventSection,
  UpsellCardButtonOrientations,
  getUpsellCardButtonGroup,
  UpsellCardImageClass
};
