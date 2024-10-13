import { TranslateFunction } from 'react-utilities';

// Feature team can choose to define their promptline and title here,
// also add the translation under Amp.Upsell namespace.
// If not defined, will use the default version of prologues.
const promptLineDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.Title.{AmpFeatureName}'
  CanCorrectAge: 'PrologueSetting.PromptLine.CanCorrectAge'
};

const titleDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.Title.{AmpFeatureName}'
};

export function getProloguePromptLine(featureName: string): string {
  return promptLineDictionary[featureName];
}

export function getPrologueTitle(featureName: string): string {
  return titleDictionary[featureName];
}

export type prologueSettingDictionary = {
  [featureName: string]: string;
};

export function getPrologueTranslatedTitle(
  featureName: string,
  defaultTitle: string,
  translate: TranslateFunction
): string {
  const featureTitle = getPrologueTitle(featureName);
  const translatedTitle = featureTitle || defaultTitle;
  return translate(translatedTitle);
}

export function getPrologueTranslatedBodyText(
  featureName: string,
  defaultText: string,
  connectingText: string,
  translate: TranslateFunction
): string {
  const featurePromptLine = getProloguePromptLine(featureName);
  const translatedBodyText = featurePromptLine
    ? `${translate(featurePromptLine)}, ${translate(connectingText)}`
    : translate(defaultText);
  return translatedBodyText;
}
