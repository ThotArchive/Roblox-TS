import catalogDataStore from "./catalog/catalogDataStore";
import gameAutoLocalizationDataStore from "./gameAutoLocalization/gameAutoLocalizationDataStore";
import gameAutomaticTranslationDataStore from "./gameAutomaticTranslation/gameAutomaticTranslationDataStore";
import gameLanguagesDataStore from "./gameLanguages/gameLanguagesDataStore";
import gameSourceLanguageDataStore from "./gameSourceLanguage/gameSourceLanguageDataStore";
import gameThumbnailsDataStore from "./thumbnails/gameThumbnailsDataStore";
import gameTranslationAnalyticsDataStore from "./gameTranslationAnalytics/gameTranslationAnalyticsDataStore";
import gamesDataStore from "./games/gamesDataStore";
import * as hbacIndexedDB from "../../auth/internal/indexedDB";
import inventoryDataStore from "./inventory/inventoryDataStore";
import localeDataStore from "./locale/localeDataStore";
import thumbnailsDataStore from "./thumbnails/thumbnailsDataStore";
import translationProgressDataStore from "./translationProgress/translationProgressDataStore";
import translationRolesDataStore from "./translationRoles/translationRolesDataStore";
import userDataStore from "./userData/userDataStore";
import authIntentDataStore from "./authIntent/authIntentDataStore";

// please keep this alphabetical
export default {
  authIntentDataStore,
  catalogDataStore,
  gameAutoLocalizationDataStore,
  gameAutomaticTranslationDataStore,
  gameLanguagesDataStore,
  gameSourceLanguageDataStore,
  gameThumbnailsDataStore,
  gameTranslationAnalyticsDataStore,
  gamesDataStore,
  hbacIndexedDB,
  inventoryDataStore,
  localeDataStore,
  thumbnailsDataStore,
  translationProgressDataStore,
  translationRolesDataStore,
  userDataStore,
  // remove after release friends
  userDataStoreV2: userDataStore,
};
