type TConfig = {
  common: string[];
  feature: string;
};
export const signupTranslationConfig: TConfig = {
  common: ['Common.Captcha', 'CommonUI.Controls'],
  feature: 'Authentication.SignUp'
};

export const landingTranslationConfig: TConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Feature.Landing'
};

export const idVerificationTranslationConfig: TConfig = {
  common: [],
  feature: 'Feature.IdVerification'
};

export const oneTimePassTranslationConfig: TConfig = {
  common: [],
  feature: 'Authentication.OneTimePasscode'
};

export default {
  signupTranslationConfig,
  landingTranslationConfig,
  idVerificationTranslationConfig,
  oneTimePassTranslationConfig
};
