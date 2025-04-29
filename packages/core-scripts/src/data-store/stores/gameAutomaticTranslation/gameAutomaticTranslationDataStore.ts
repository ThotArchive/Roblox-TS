import { AxiosPromise } from "axios";
import * as GameInternationalizationProvider from "../../providers/gameInternationalization/gameInternationalizationProvider";

const automaticTranslationApiInstance =
  new GameInternationalizationProvider.AutomaticTranslationApi();

const getGameFeatureStatus = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiGetAutomaticTranslationFeatureStatusForGameResponse> =>
  automaticTranslationApiInstance.v1AutomaticTranslationGamesGameIdFeatureStatusGet(gameId, {
    withCredentials: true,
  });

const getTargetLanguages = (
  sourceLanguageCode: string,
  targetLanguageCodes: string[],
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiGetAllowedAutomaticTranslationStatusForLanguagesResponse> =>
  automaticTranslationApiInstance.v1AutomaticTranslationLanguagesLanguageCodeTargetLanguagesGet(
    sourceLanguageCode,
    targetLanguageCodes,
    { withCredentials: true },
  );

const getGameAutoLocalizationQuota = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiGetAutomaticTranslationQuotaForGameResponse> =>
  automaticTranslationApiInstance.v1AutomaticTranslationGamesGameIdQuotaGet(gameId, {
    withCredentials: true,
  });

export default {
  getGameFeatureStatus,
  getTargetLanguages,
  getGameAutoLocalizationQuota,
};
