type TConfig = {
  common: string[];
  feature: string;
};
export const loginTranslationConfig: TConfig = {
  common: ['Common.Captcha'],
  feature: 'Authentication.Login'
};

export const oneTimePassTranslationConfig: TConfig = {
  common: [],
  feature: 'Authentication.OneTimePasscode'
};
