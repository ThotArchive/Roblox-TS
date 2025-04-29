import { UpsellCardType } from '../constants/upsellCardConstants';

const isCardTypeSupported = cardType => {
  const {
    ContactMethodEmail,
    ContactMethodPhoneNumber,
    FacebookSunset,
    ContactMethodPhoneNumberEmailHorizontalLayout,
    ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1,
    ContactMethodPhoneNumberEmailVerticalLayout,
    ContactMethodPhoneNumberVoiceOptIn
  } = UpsellCardType;
  if (
    [
      ContactMethodEmail,
      ContactMethodPhoneNumber,
      ContactMethodPhoneNumberEmailHorizontalLayout,
      ContactMethodPhoneNumberEmailHorizontalLayoutAltContent1,
      ContactMethodPhoneNumberEmailVerticalLayout,
      ContactMethodPhoneNumberVoiceOptIn,
      FacebookSunset
    ].includes(cardType)
  ) {
    return true;
  }
  return false;
};

export default isCardTypeSupported;
