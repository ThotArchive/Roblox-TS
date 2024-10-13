type TConfig = {
  common: string[];
  feature: string;
};
export const loginTranslationConfig: TConfig = {
  common: ['Common.Captcha'],
  feature: 'Authentication.Login'
};

export const screentimeTranslationConfig: TConfig = {
  common: [],
  feature: 'Feature.Screentime'
};

export const idVerificationTranslationConfig: TConfig = {
  common: [],
  feature: 'Feature.IdVerification'
};

export const accountSwitchingTranslationConfig: TConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Authentication.AccountSwitch'
};

export default {
  loginTranslationConfig,
  screentimeTranslationConfig,
  idVerificationTranslationConfig,
  accountSwitchingTranslationConfig
};
