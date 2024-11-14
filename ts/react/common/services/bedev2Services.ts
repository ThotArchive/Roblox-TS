import { AxiosResponse } from 'axios';
import { httpService } from 'core-utilities';
import { TUserAuthIntent } from 'core-roblox-utilities';
import { EnvironmentUrls } from 'Roblox';
import experimentConstants from '../constants/experimentConstants';
import bedev2Constants from '../constants/bedev2Constants';
import {
  TExploreApiGameSortResponse,
  TExploreApiSortsResponse,
  TGetOmniRecommendationsMetadataResponse,
  TGetOmniRecommendationsResponse,
  TGetOmniSearchParsedResponse,
  TGetOmniSearchResponse,
  TOmniRecommendation,
  TOmniSearchContentType,
  TOmniSearchGameDataModel,
  TSendSurveyResultsResponse,
  TSurvey,
  TSurveyResponseBody,
  TTreatmentType
} from '../types/bedev2Types';
import {
  TDeveloperProduct,
  TGetGameTransactionsParams,
  TListDeveloperProductParams,
  TListDeveloperProductResponseArray,
  TGetGameTransactionsResponse
} from '../types/developerProductTypes';
import { TPageType } from '../types/bedev1Types';
import { TDeviceFeatures } from '../utils/deviceFeaturesUtils';
import { getInputUniverseIdsRequestParam } from '../utils/parsingUtils';
import processDeveloperProductResult from '../utils/processDeveloperProductResult';
import mapDeveloperProductsAndReceipts from '../utils/mapDeveloperProductsAndReceipts';

const getExperimentationValues = async <T extends Record<string, number | string | boolean>>(
  layerName: string,
  defaultValues: T,
  projectId = 1
): Promise<T> => {
  try {
    const { data } = ((await httpService.get(
      experimentConstants.url.getExperimentationValues(
        projectId,
        layerName,
        Object.keys(defaultValues)
      )
    )) as unknown) as AxiosResponse<T>;
    const parsedData = Object.keys(data).reduce<Record<string, any>>((acc, item) => {
      if (data[item] !== null) {
        acc[item] = data[item];
      }
      return acc;
    }, {});
    return { ...defaultValues, ...parsedData };
  } catch {
    return defaultValues;
  }
};

export const getOmniRecommendations = async (
  pageType: TPageType,
  sessionId: string,
  deviceFeatures?: TDeviceFeatures,
  authIntentFeatures?: TUserAuthIntent,
  interestedUniverses?: number[]
): Promise<TGetOmniRecommendationsResponse> => {
  const params = {
    pageType,
    sessionId,
    supportedTreatmentTypes: [TTreatmentType.SortlessGrid],
    authIntentData: authIntentFeatures,
    ...deviceFeatures,
    ...getInputUniverseIdsRequestParam(interestedUniverses)
  };

  const { data } = await httpService.post<TGetOmniRecommendationsResponse>(
    bedev2Constants.url.getOmniRecommendations,
    params
  );

  Object.keys(data.contentMetadata.Game).forEach(universeId => {
    const gameData = data.contentMetadata.Game[universeId];
    gameData.placeId = gameData.rootPlaceId as number;
  });

  return data;
};

export const getOmniRecommendationsMetadata = async (
  recommendationList: TOmniRecommendation[],
  sessionId: string
): Promise<TGetOmniRecommendationsMetadataResponse> => {
  const { data } = await httpService.post<TGetOmniRecommendationsMetadataResponse>(
    bedev2Constants.url.getOmniRecommendationsMetadata,
    {
      contents: recommendationList,
      sessionId
    }
  );

  Object.keys(data.contentMetadata.Game).forEach(universeId => {
    const gameData = data.contentMetadata.Game[universeId];
    gameData.placeId = gameData.rootPlaceId as number;
  });

  return data;
};

export const getOmniSearch = async (
  searchQuery: string,
  pageToken: string,
  sessionId: string,
  pageType: string
): Promise<TGetOmniSearchParsedResponse> => {
  const { data } = await httpService.get<TGetOmniSearchResponse>(
    bedev2Constants.url.getOmniSearch,
    {
      searchQuery,
      pageToken,
      sessionId,
      pageType
    }
  );

  const gamesList: TOmniSearchGameDataModel[] = [];

  if (data && data.searchResults && data.searchResults.length > 0) {
    data.searchResults.forEach(contentGroup => {
      // 08/31/22 Currently the backend only returns the "Game" content type.
      // Future content types can be added here for parsing.
      if (contentGroup.contentGroupType === TOmniSearchContentType.Game) {
        const contents = contentGroup.contents as TOmniSearchGameDataModel[];
        contents.forEach(item => {
          gamesList.push(item);
        });
      }
    });
  }

  return {
    filteredSearchQuery: data.filteredSearchQuery,
    nextPageToken: data.nextPageToken,
    gamesList
  };
};

export const getExploreSorts = (
  sessionId: string,
  sortsPageToken: string | undefined,
  filters: Map<string, string>,
  deviceFeatures?: TDeviceFeatures
): Promise<TExploreApiSortsResponse> => {
  const filterParams: Record<string, string> = {};
  filters.forEach((value, key) => {
    filterParams[key] = value;
  });

  return httpService
    .get<TExploreApiSortsResponse>(bedev2Constants.url.getExploreSorts, {
      sessionId,
      sortsPageToken,
      ...filterParams,
      ...deviceFeatures
    })
    .then(response => {
      return response.data;
    });
};

export const getExploreSortContents = (
  sessionId: string,
  sortId: string,
  pageToken: string | undefined,
  filters: Map<string, string>,
  deviceFeatures?: TDeviceFeatures
): Promise<TExploreApiGameSortResponse> => {
  const filterParams: Record<string, string> = {};
  filters.forEach((value, key) => {
    filterParams[key] = value;
  });

  return httpService
    .get<TExploreApiGameSortResponse>(bedev2Constants.url.getExploreSortContents, {
      sessionId,
      sortId,
      pageToken,
      ...filterParams,
      ...deviceFeatures
    })
    .then(response => {
      return response.data;
    });
};

export const getSurvey = (locationName: string, resourceId?: string): Promise<TSurvey> => {
  const params = resourceId ? { resourceId } : undefined;
  return httpService
    .get<TSurvey>(bedev2Constants.url.getSurvey(locationName), params)
    .then(response => {
      return response.data;
    });
};

const postSurveyResults = async (
  token: string,
  locationName: string,
  selectedText?: string[],
  selectedIds?: number[],
  resourceId?: string
): Promise<TSendSurveyResultsResponse> => {
  const requestBody: TSurveyResponseBody = {
    selectedText,
    selectedIds,
    resourceId,
    token
  };

  const urlConfig = bedev2Constants.url.postSurveyResults(locationName);
  const response = await httpService.post<TSendSurveyResultsResponse>(urlConfig, requestBody);
  return response.data;
};

export const getThumbnailForAsset = async (assetId: number): Promise<string> => {
  return httpService
    .get<{ data?: Array<{ state?: string; imageUrl?: string }> }>(
      {
        url: `${EnvironmentUrls.thumbnailsApi}/v1/assets`,
        timeout: 10000,
        withCredentials: true
      },
      {
        assetIds: [assetId],
        size: '768x432',
        format: 'Png'
      }
    )
    .then(result => {
      if (result.data.data?.[0]?.state === 'Completed' && result.data.data?.[0]?.imageUrl) {
        return result.data.data[0].imageUrl;
      }
      return Promise.reject();
    });
};

export const getDeveloperProductsByUniverseId = async (
  universeId: number,
  page: number,
  pageSize: number
): Promise<TDeveloperProduct[]> => {
  const urlConfig = bedev2Constants.url.getDeveloperProductsForStorePage(universeId.toString());
  const params: TListDeveloperProductParams = {
    page,
    pageSize,
    storePageEnabled: true
  };
  const result = await httpService
    .get<TListDeveloperProductResponseArray>(urlConfig, params)
    .then(response => response.data);
  return result
    .map(processDeveloperProductResult)
    .filter((item): item is TDeveloperProduct => item !== null); // map method returns null for invalid dev products
};

export const getPendingDeveloperProducts = async (
  rootPlaceId: number,
  playerId: number
): Promise<Map<number, number>> => {
  const urlConfig = bedev2Constants.url.getGameTransactions;
  const params: TGetGameTransactionsParams = {
    placeId: rootPlaceId,
    playerId,
    status: 'pending'
  };
  const transactions = await httpService
    .get<TGetGameTransactionsResponse>(urlConfig, params)
    .then(response => response.data);
  return mapDeveloperProductsAndReceipts(transactions);
};

export default {
  getExperimentationValues,
  getOmniRecommendations,
  getOmniRecommendationsMetadata,
  getOmniSearch,
  getExploreSorts,
  getExploreSortContents,
  getSurvey,
  postSurveyResults,
  getThumbnailForAsset,
  getDeveloperProductsByUniverseId,
  getPendingDeveloperProducts
};
