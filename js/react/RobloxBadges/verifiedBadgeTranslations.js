import { TranslationResourceProvider, Intl } from 'Roblox';
import { translationConfig } from './translation.config';

export const DEFAULT_BADGE_ICON_ENGLISH_ALT_TEXT = 'Verified Badge Icon';

export const DEFAULT_BADGE_MODAL_TITLE_ENGLISH_TEXT = 'Verified Badge';

export const DEFAULT_BADGE_MODAL_BODY_ENGLISH_TEXT =
  'This badge verifies that the holder is a notable and authentic creator, brand, or public figure.';

export const DEFAULT_BADGE_MODAL_BODY_LINK_ENGLISH_TEXT = 'Learn More';

export const DEFAULT_BADGE_USERNAME_CHANGE_ENGLISH_TEXT = `Important: This change will result in the loss of your verified badge.

Your original account creation date will carry over to your new username.`;

export const DEFAULT_BADGE_DISPLAYNAME_CHANGE_ENGLISH_TEXT = `Important: This change will result in the loss of your verified badge.

Your display name can only be changed once every 7 days.`;

export const DEFAULT_BADGE_GROUPNAME_CHANGE_ENGLISH_TEXT = 'the verified badge will be removed.';

export const DEFAULT_BADGE_TWO_SV_CHANGE_ENGLISH_TEXT =
  'Disabling 2-Step Verification will result in the loss of your verified badge and make your account less secure. Are you sure you want to proceed?';

export const DEFAULT_BADGE_MODAL_CLOSE_BUTTON_TEXT = 'Close';

export const fetchTranslations = () => {
  let fetchedTranslatedVerifiedBadgeTitleText;
  let fetchedTranslatedVerifiedBadgeModalTitleText;
  let fetchedTranslatedVerifiedBadgeModalBodyText;
  let fetchedTranslatedVerifiedBadgeModalLearnMoreLinkText;
  let fetchedTranslatedVerifiedBadgeModalUsernameChangeText;
  let fetchedTranslatedVerifiedBadgeModalTwoSVChangeText;
  let fetchedTranslatedVerifiedBadgeModalGroupNameChangeText;
  let fetchedTranslatedVerifiedBadgeModalDisplayNameChangeText;
  let fetchedTranslatedVerifiedBadgeModalCloseButtonText;

  if (TranslationResourceProvider && Intl) {
    const intl = new Intl();
    const translationProvider = new TranslationResourceProvider(intl);
    const { common, feature } = translationConfig;

    const languageResources = [...common, feature]
      .filter(namespace => !!namespace)
      .map(namespace => translationProvider.getTranslationResource(namespace));

    const verifiedBadgestranslationsProvider = translationProvider.mergeTranslationResources(
      ...languageResources
    );

    fetchedTranslatedVerifiedBadgeTitleText = verifiedBadgestranslationsProvider.get(
      'Creator.VerifiedBadgeIconAccessibilityText'
    );

    fetchedTranslatedVerifiedBadgeModalTitleText = verifiedBadgestranslationsProvider.get(
      'VerifiedBadgeInfoTitle'
    );

    fetchedTranslatedVerifiedBadgeModalBodyText = verifiedBadgestranslationsProvider.get(
      'VerifiedBadgeInfo'
    );

    fetchedTranslatedVerifiedBadgeModalLearnMoreLinkText = verifiedBadgestranslationsProvider.get(
      'VerifiedBadgeInfoLink'
    );

    fetchedTranslatedVerifiedBadgeModalUsernameChangeText = verifiedBadgestranslationsProvider.get(
      'UsernameChangeWithVerifiedBadge'
    );

    fetchedTranslatedVerifiedBadgeModalTwoSVChangeText = verifiedBadgestranslationsProvider.get(
      'TwoSVWithVerifiedBadge'
    );

    fetchedTranslatedVerifiedBadgeModalGroupNameChangeText = verifiedBadgestranslationsProvider.get(
      'GroupNameChangeWithVerifiedBadge'
    );

    fetchedTranslatedVerifiedBadgeModalDisplayNameChangeText = verifiedBadgestranslationsProvider.get(
      'DisplayNameChangeWithVerifiedBadge'
    );

    fetchedTranslatedVerifiedBadgeModalCloseButtonText = verifiedBadgestranslationsProvider.get(
      'action.close'
    );
  }

  return {
    translatedVerifiedBadgeTitleText:
      fetchedTranslatedVerifiedBadgeTitleText || DEFAULT_BADGE_ICON_ENGLISH_ALT_TEXT,
    translatedVerifiedBadgeModalTitleText:
      fetchedTranslatedVerifiedBadgeModalTitleText || DEFAULT_BADGE_MODAL_TITLE_ENGLISH_TEXT,
    translatedVerifiedBadgeModalBodyText:
      fetchedTranslatedVerifiedBadgeModalBodyText || DEFAULT_BADGE_MODAL_BODY_ENGLISH_TEXT,
    translatedVerifiedBadgeModalLearnMoreLinkText:
      fetchedTranslatedVerifiedBadgeModalLearnMoreLinkText ||
      DEFAULT_BADGE_MODAL_BODY_LINK_ENGLISH_TEXT,
    translatedVerifiedBadgeUsernameChangeText:
      fetchedTranslatedVerifiedBadgeModalUsernameChangeText ||
      DEFAULT_BADGE_USERNAME_CHANGE_ENGLISH_TEXT,
    translatedVerifiedBadgeTwoSVChangeText:
      fetchedTranslatedVerifiedBadgeModalTwoSVChangeText ||
      DEFAULT_BADGE_TWO_SV_CHANGE_ENGLISH_TEXT,
    translatedVerifiedBadgeGroupNameChangeText:
      fetchedTranslatedVerifiedBadgeModalGroupNameChangeText ||
      DEFAULT_BADGE_GROUPNAME_CHANGE_ENGLISH_TEXT,
    translatedVerifiedBadgeDisplayNameChangeText:
      fetchedTranslatedVerifiedBadgeModalDisplayNameChangeText ||
      DEFAULT_BADGE_DISPLAYNAME_CHANGE_ENGLISH_TEXT,
    translatedVerifiedBadgeModalCloseButtonText:
      fetchedTranslatedVerifiedBadgeModalCloseButtonText || DEFAULT_BADGE_MODAL_CLOSE_BUTTON_TEXT
  };
};
