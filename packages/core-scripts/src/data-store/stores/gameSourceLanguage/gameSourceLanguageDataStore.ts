import { AxiosPromise } from "axios";
import * as GameInternationalizationProvider from "../../providers/gameInternationalization/gameInternationalizationProvider";

const sourceLanguageApiInstance = new GameInternationalizationProvider.SourceLanguageApi();

const getSourceLanguage = (
  gameId: number,
): AxiosPromise<GameInternationalizationProvider.RobloxGameInternationalizationApiLanguage> =>
  sourceLanguageApiInstance.v1SourceLanguageGamesGameIdGet(gameId, {
    withCredentials: true,
  });

const updateSourceLanguage = (gameId: number, sourceLanguageCode: string): AxiosPromise<object> =>
  sourceLanguageApiInstance.v1SourceLanguageGamesGameIdPatch(gameId, sourceLanguageCode, {
    withCredentials: true,
  });

export default {
  getSourceLanguage,
  updateSourceLanguage,
};
