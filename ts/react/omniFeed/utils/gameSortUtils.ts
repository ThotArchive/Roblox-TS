import { EventStreamMetadata } from '../../common/constants/eventStreamConstants';
import { TGameData } from '../../common/types/bedev1Types';
import {
  TExploreApiFiltersSort,
  TExploreApiFiltersSortResponse,
  TExploreApiGameSort,
  TExploreApiGameSortResponse,
  TExploreApiSort,
  TExploreApiSortResponse,
  TExploreApiSorts,
  TExploreApiSortsResponse,
  TGameSort,
  TOmniRecommendationGame,
  TOmniRecommendationGameSort,
  TOmniRecommendationsContentMetadata,
  TOmniRecommendationSort
} from '../../common/types/bedev2Types';

export const hydrateOmniRecommendationGames = (
  recommendations: TOmniRecommendationGame[],
  contentMetadata: TOmniRecommendationsContentMetadata | null
): TGameData[] => {
  return recommendations
    .map(
      ({
        contentType,
        contentId,
        contentMetadata: recommendationContentMetadata
      }: TOmniRecommendationGame) => {
        const data = contentMetadata?.[contentType]?.[contentId];
        if (data) {
          const gameData = { ...data } as TGameData;

          const nativeAdData = recommendationContentMetadata?.EncryptedAdTrackingData;
          gameData.isSponsored = nativeAdData?.length > 0;
          gameData.nativeAdData = nativeAdData;

          return gameData;
        }

        return data;
      }
    )
    .filter(
      (recommendation: TGameData | undefined): recommendation is TGameData =>
        recommendation !== undefined
    );
};

const isOmniRecommendationGameSort = (
  gameSort: TGameSort
): gameSort is TOmniRecommendationGameSort => {
  return 'recommendationList' in gameSort;
};

export const isGameSortFromOmniRecommendations = (
  sort: TOmniRecommendationSort
): sort is TOmniRecommendationGameSort => {
  return 'recommendationList' in sort;
};

export const isExploreApiGameSort = (gameSort: TGameSort): gameSort is TExploreApiGameSort => {
  return 'games' in gameSort;
};

export const isGameSortFromExploreApi = (sort: TExploreApiSort): sort is TExploreApiGameSort => {
  return 'games' in sort;
};

export const isFilterSortFromExploreApi = (
  sort: TExploreApiSort
): sort is TExploreApiFiltersSort => {
  return 'filters' in sort;
};

export const getHydratedGameData = (
  sort: TGameSort,
  contentMetadata: TOmniRecommendationsContentMetadata | null
): TGameData[] => {
  if (isOmniRecommendationGameSort(sort)) {
    return hydrateOmniRecommendationGames(sort.recommendationList, contentMetadata);
  }

  if (isExploreApiGameSort(sort)) {
    return sort.games;
  }

  return [];
};

const isExploreApiGameSortResponse = (
  sort: TExploreApiSortResponse
): sort is TExploreApiGameSortResponse => {
  return 'games' in sort;
};

export const mapExploreApiGameSortResponse = (
  sort: TExploreApiGameSortResponse
): TExploreApiGameSort => {
  return {
    topic: sort.sortDisplayName,
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    games: sort.games.map(game => {
      return {
        ...game,
        placeId: game.placeId ?? game.rootPlaceId
      };
    }),
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || '',
    subtitle: sort.subtitle,
    topicLayoutData: sort.topicLayoutData,
    appliedFilters: sort.appliedFilters
  };
};

const mapExploreApiFiltersSortResponse = (
  sort: TExploreApiFiltersSortResponse
): TExploreApiFiltersSort => {
  return {
    topic: sort.sortDisplayName,
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    filters: sort.filters,
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || '',
    subtitle: sort.subtitle,
    topicLayoutData: sort.topicLayoutData
  };
};

export const mapExploreApiSortResponse = (sort: TExploreApiSortResponse): TExploreApiSort => {
  if (isExploreApiGameSortResponse(sort)) {
    return mapExploreApiGameSortResponse(sort);
  }

  return mapExploreApiFiltersSortResponse(sort);
};

export const mapExploreApiSortsResponse = (data: TExploreApiSortsResponse): TExploreApiSorts => {
  return {
    sorts: data.sorts.map(sort => mapExploreApiSortResponse(sort)),
    nextSortsPageToken: data.nextSortsPageToken
  };
};

export const getSortTargetId = (sort: TGameSort | undefined): number | undefined => {
  if (sort && isExploreApiGameSort(sort)) {
    return sort.gameSetTargetId;
  }

  return undefined;
};

export const getSortTargetIdMetadata = (
  sort: TGameSort | undefined
):
  | {
      [EventStreamMetadata.GameSetTargetId]: number;
    }
  | {} => {
  const gameSetTargetId = getSortTargetId(sort);

  if (gameSetTargetId !== undefined) {
    return {
      [EventStreamMetadata.GameSetTargetId]: gameSetTargetId
    };
  }

  return {};
};

/**
 * Extracts the filters from the first filter sort found in the Explore API response
 */
export const extractFiltersFromExploreSorts = (
  sorts: TExploreApiSort[]
): Map<string, string> | undefined => {
  const firstFilterSort = sorts.find(isFilterSortFromExploreApi);

  if (!firstFilterSort) {
    return undefined;
  }

  const filters = new Map<string, string>();

  firstFilterSort.filters.forEach(filter => {
    filters.set(filter.filterType, filter.selectedOptionId);
  });

  return filters;
};

export const getSortAppliedFiltersMetadata = (
  sort: TGameSort | undefined
): { [EventStreamMetadata.AppliedFilters]: string } | {} => {
  if (sort && isExploreApiGameSort(sort) && sort.appliedFilters) {
    return {
      [EventStreamMetadata.AppliedFilters]: encodeURIComponent(sort.appliedFilters)
    };
  }

  return {};
};

/**
 * Parse the appliedFilters string passed from BE in the format of
 * "filterType=selectedOptionId,filterType=selectedOptionId"
 */
export const parseAppliedFilters = (sort: TGameSort): Record<string, string> => {
  if (isExploreApiGameSort(sort) && sort.appliedFilters) {
    const filtersObj: Record<string, string> = {};

    const allFilters = sort.appliedFilters.split(',');

    allFilters.forEach(filter => {
      const [filterType, filterValue] = filter.split('=');

      if (filterType && filterValue) {
        filtersObj[filterType] = filterValue;
      }
    });

    return filtersObj;
  }

  return {};
};

export default {
  hydrateOmniRecommendationGames,
  getHydratedGameData,
  mapExploreApiSortsResponse,
  getSortTargetIdMetadata,
  isGameSortFromOmniRecommendations,
  extractFiltersFromExploreSorts
};
