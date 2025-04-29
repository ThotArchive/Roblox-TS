import { AxiosPromise } from "axios";
import * as GameInternationalizationProvider from "../../providers/gameInternationalization/gameInternationalizationProvider";
import * as GameInternationalizationProviderV2 from "../../providers/gameInternationalizationV2/gameInternationalizationV2Provider";

const supportedLanguagesApiInstance = new GameInternationalizationProvider.SupportedLanguagesApi();
const supportedLanguagesV2ApiInstance =
  new GameInternationalizationProviderV2.SupportedLanguagesV2Api();
const localizationTableApiInstance = new GameInternationalizationProvider.LocalizationTableApi();

const getGameLanguageRolloutSettings =
  (): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiSupportedLanguagesMetadataResponse> =>
    supportedLanguagesApiInstance.v1SupportedLanguagesMetadataGet({ withCredentials: true });

const getGameLanguages = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageOrLocale> =>
  supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdGet(gameId, {
    withCredentials: true,
  });

const getGameLanguagesV2 = (
  gameId: number,
): AxiosPromise<GameInternationalizationProviderV2.RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales> =>
  supportedLanguagesV2ApiInstance.v2SupportedLanguagesGamesGameIdGet(gameId, {
    withCredentials: true,
  });

const addLanguages = (gameId: number, languageCodesToAdd: string[]): AxiosPromise<object> => {
  const languagesToAdd: GameInternationalizationProvider.RobloxGameInternationalizationApiPatchLanguage[] =
    languageCodesToAdd.map(languageCode => ({
      languageCodeType:
        GameInternationalizationProvider
          .RobloxGameInternationalizationApiPatchLanguageLanguageCodeTypeEnum.Language,
      languageCode,
    }));

  return supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdPatch(
    gameId,
    languagesToAdd,
    { withCredentials: true },
  );
};

const deleteLanguages = (gameId: number, languageCodesToDelete: string[]): AxiosPromise<object> => {
  const languageToDelete: GameInternationalizationProvider.RobloxGameInternationalizationApiPatchLanguage[] =
    languageCodesToDelete.map(languageCode => ({
      languageCodeType:
        GameInternationalizationProvider
          .RobloxGameInternationalizationApiPatchLanguageLanguageCodeTypeEnum.Language,
      languageCode,
      delete: true,
    }));

  return supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdPatch(
    gameId,
    languageToDelete,
    { withCredentials: true },
  );
};

// remove after rollout of non-official languages feature
const getAvailableLanguages =
  (): AxiosPromise<GameInternationalizationProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguage> =>
    localizationTableApiInstance.v1LocalizationtableAvailableLanguagesGet();

const getAutomaticTranslationStatus = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageOrLocaleSettings> =>
  supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdAutomaticTranslationStatusGet(
    gameId,
    { withCredentials: true },
  );

const setAutomaticTranslationStatus = (
  gameId: number,
  enableAutomaticTranslation: boolean,
  languageCode: string,
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiEditAutomaticTranslationStatusForGameAndLanguageResponse> =>
  supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdLanguagesLanguageCodeAutomaticTranslationStatusPatch(
    gameId,
    languageCode,
    enableAutomaticTranslation,
    { withCredentials: true },
  );

const getAutomaticTranslationSwitchesValues = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiUniverseDisplayInfoAutomaticTranslationSettings> =>
  supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdUniverseDisplayInfoAutomaticTranslationSettingsGet(
    gameId,
    { withCredentials: true },
  );

const setAutomaticTranslationSwitchesValue = (
  gameId: number,
  enableUniverseDisplayInfoAutomaticTranslation: boolean,
  languageCode: string,
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiUpdateUniverseDisplayInfoAutomaticTranslationSettingsResponse> =>
  supportedLanguagesApiInstance.v1SupportedLanguagesGamesGameIdLanguagesLanguageCodeUniverseDisplayInfoAutomaticTranslationSettingsPatch(
    gameId,
    languageCode,
    enableUniverseDisplayInfoAutomaticTranslation,
    { withCredentials: true },
  );

export default {
  getGameLanguageRolloutSettings,
  getGameLanguages,
  getGameLanguagesV2,
  addLanguages,
  deleteLanguages,
  getAvailableLanguages,
  getAutomaticTranslationStatus,
  setAutomaticTranslationStatus,
  getAutomaticTranslationSwitchesValues,
  setAutomaticTranslationSwitchesValue,
};
