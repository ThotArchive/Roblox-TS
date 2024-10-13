type TConfig = {
  common: string[];
  feature: string;
};

export const bannerTranslationConfig: TConfig = {
  common: ['CommonUI.Messages', 'CommonUI.Controls'],
  feature: 'Feature.Tracking'
};

export default { bannerTranslationConfig };
