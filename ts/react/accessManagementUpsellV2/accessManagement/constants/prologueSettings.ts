import { TranslateFunction } from 'react-utilities';
import { PrologueConstants } from './viewConstants';

// Feature team can choose to define their promptline and title here,
// also add the translation under Amp.Upsell namespace.
// If not defined, will use the default version of prologues.
const promptLineDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.PromptLine.{AmpFeatureName}'
  CanCorrectAge: 'PrologueSetting.PromptLine.CanCorrectAge'
};

const titleDictionary: prologueSettingDictionary = {
  // Example
  // {AmpFeatureName}: 'PrologueSetting.Title.{AmpFeatureName}'
};

export function getProloguePromptLine(
  featureName: string,
  recourseParameters?: Record<string, string> | null
): string {
  // Temporary fix to show the "experiences" string only for the contentAgeRestriction
  // case of "CanChangeSetting", since the "CanChangeSetting" feature can be used for other settings.
  if (featureName === 'CanChangeSetting') {
    if (recourseParameters?.contentAgeRestriction !== undefined) {
      return 'PrologueSetting.PromptLine.CanChangeSetting';
    }
  }

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
  translate: TranslateFunction,
  recourseParameters?: Record<string, string> | null
): string {
  if (recourseParameters?.enablePurchases !== undefined) {
    return translate(PrologueConstants.Description.VpcEnablePurchase);
  }
  const featurePromptLine = getProloguePromptLine(featureName, recourseParameters);

  const translatedBodyText = featurePromptLine
    ? `${translate(featurePromptLine)}, ${translate(connectingText)}`
    : translate(defaultText);
  return translatedBodyText;
}
