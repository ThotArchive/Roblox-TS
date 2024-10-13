import { httpService } from 'core-utilities';
import searchConstants from '../constants/searchConstants';

let cancelToken = httpService.createCancelToken();

export enum GamesAutocompleteSuggestionEntryType {
  GameSuggestion = 0,
  QuerySuggestion = 1,
  TrendingQuerySuggestion = 2
}

export type TGamesAutocompleteSuggestionEntry = {
  type: GamesAutocompleteSuggestionEntryType;
  score: number;
  universeId: number;
  canonicalTitle: string;
  thumbnailUrl: string;
  searchQuery: string;
  trendingSearchStartDateTime: string;
};

export type TGamesAutocompleteSuggestion = {
  prefix: string;
  algorithmName: string;
  entries: TGamesAutocompleteSuggestionEntry[];
};

export const getSearchSuggestion = async (
  search: string
): Promise<TGamesAutocompleteSuggestion> => {
  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = httpService.createCancelToken();

  const { data } = await httpService.get<TGamesAutocompleteSuggestion>({
    ...searchConstants.getSuggestionUrl,
    url: searchConstants.getSuggestionUrl.url + encodeURIComponent(search.toLowerCase()),
    cancelToken: cancelToken.token
  });

  return data;
};

export const postRequestSuggestion = async (
  search: string
): Promise<TGamesAutocompleteSuggestion> => {
  const params = {
    prefix: search.toLowerCase(),
    variationId: searchConstants.variationId,
    trendingSearchId: searchConstants.trendingVariationId
  };

  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = httpService.createCancelToken();

  const { data } = await httpService.post<TGamesAutocompleteSuggestion>(
    {
      ...searchConstants.requestSuggestionUrl,
      timeout: searchConstants.expiryTimeout,
      cancelToken: cancelToken.token,
      fullError: true
    },
    params
  );

  return data;
};

export type TAvatarAutocompleteSuggestion = {
  Args: {};
  Data: TAvatarAutocompleteSuggestionEntry[];
};

export type TAvatarAutocompleteSuggestionEntry = {
  Query: string;
  Score: number;
};

export const getAvatarRequestSuggestion = async (
  search: string,
  languageCode: string,
  limit: number,
  previousQuery: string,
  useFallback = false
): Promise<TAvatarAutocompleteSuggestion> => {
  let lang = languageCode;
  if (lang === null) {
    lang = searchConstants.englishLanguageCode;
  }
  const params = {
    prefix: search.toLowerCase(),
    limit,
    lang,
    q: previousQuery
  };

  // Cancels any previous requests that are stil dangling
  cancelToken.cancel();
  cancelToken = httpService.createCancelToken();

  if (useFallback) {
    const { data } = await httpService.get<TAvatarAutocompleteSuggestion>(
      {
        ...searchConstants.avatarRequestSuggestionUrl,
        timeout: searchConstants.expiryTimeout,
        cancelToken: cancelToken.token,
        fullError: true
      },
      params
    );

    return data;
  }

  const { data } = await httpService.get<TAvatarAutocompleteSuggestion>(
    {
      ...searchConstants.avatarRequestSuggestionCdnUrl,
      timeout: searchConstants.expiryTimeout,
      cancelToken: cancelToken.token,
      fullError: true
    },
    params
  );

  return data;
};

export default {
  getSearchSuggestion,
  postRequestSuggestion,
  getAvatarRequestSuggestion
};
