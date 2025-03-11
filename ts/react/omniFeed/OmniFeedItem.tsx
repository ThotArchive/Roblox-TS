import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { TOmniRecommendationGame, TSort, TTreatmentType } from '../common/types/bedev2Types';
import GameCarouselFeedItem from './GameCarouselFeedItem';
import AvatarCarouselFeedItem from './AvatarCarouselFeedItem';
import GameGridFeedItem from './GameGridFeedItem';
import { PageContext } from '../common/types/pageContext';
import FriendCarouselFeedItem from './FriendCarouselFeedItem';
import FiltersFeedItem from './FiltersFeedItem';
import SduiFeedItem from './SduiFeedItem';
import { TOmniRecommendationSduiTree } from '../sdui/system/SduiTypes';

type TOmniFeedItemProps = {
  translate: WithTranslationsProps['translate'];
  sort: TSort;
  positionId: number;
  currentPage: PageContext.HomePage | PageContext.GamesPage | PageContext.SearchLandingPage;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  gridRecommendations?: TOmniRecommendationGame[];
  loadMoreGames?: () => void;
  isLoadingMoreGames?: boolean;
  isExpandHomeContentEnabled?: boolean;
  isChartsPageRenameEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
  sduiRoot?: TOmniRecommendationSduiTree;
  fetchGamesPageData?: (filters: Map<string, string>) => void;
};

export const OmniFeedItem = ({
  translate,
  sort,
  positionId,
  currentPage,
  itemsPerRow,
  startingRow,
  gridRecommendations,
  loadMoreGames,
  isLoadingMoreGames,
  isExpandHomeContentEnabled,
  isChartsPageRenameEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled,
  sduiRoot,
  fetchGamesPageData
}: TOmniFeedItemProps): JSX.Element | null => {
  switch (sort.treatmentType) {
    case TTreatmentType.Carousel:
      return (
        <GameCarouselFeedItem
          translate={translate}
          sort={sort}
          positionId={positionId}
          page={currentPage}
          itemsPerRow={itemsPerRow}
          startingRow={startingRow}
          loadMoreGames={loadMoreGames}
          isLoadingMoreGames={isLoadingMoreGames}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
          isChartsPageRenameEnabled={isChartsPageRenameEnabled}
          isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
        />
      );
    case TTreatmentType.AvatarCarousel:
      return <AvatarCarouselFeedItem sort={sort} />;
    case TTreatmentType.SortlessGrid:
      return (
        <GameGridFeedItem
          translate={translate}
          sort={sort}
          positionId={positionId}
          itemsPerRow={itemsPerRow}
          startingRow={startingRow}
          recommendations={gridRecommendations ?? []}
          isExpandHomeContentEnabled={isExpandHomeContentEnabled}
        />
      );
    case TTreatmentType.FriendCarousel:
      return <FriendCarouselFeedItem sortId={sort.topicId} sortPosition={positionId} />;
    case TTreatmentType.Pills:
      return (
        <FiltersFeedItem
          sort={sort}
          positionId={positionId}
          translate={translate}
          fetchGamesPageData={fetchGamesPageData}
        />
      );
    case TTreatmentType.Sdui:
      return <SduiFeedItem sort={sort} sduiRoot={sduiRoot} currentPage={currentPage} />;
    default:
      return null;
  }
};

OmniFeedItem.defaultProps = {
  loadMoreGames: undefined,
  isLoadingMoreGames: undefined,
  gridRecommendations: [],
  isExpandHomeContentEnabled: undefined,
  isChartsPageRenameEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  fetchGamesPageData: undefined,
  isNewScrollArrowsEnabled: undefined
};

export default OmniFeedItem;
