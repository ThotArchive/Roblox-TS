import React, { useMemo } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import HomePageCarouselDiscoveryApi from '../homePage/discoveryApi/HomePageCarouselDiscoveryApi';
import useFriendsPresence from '../common/hooks/useFriendsPresence';
import { TGameData } from '../common/types/bedev1Types';
import { TComponentType, TGameSort } from '../common/types/bedev2Types';
import { useContentMetadata } from './utils/contentMetadataContextProvider';
import { getNumCarouselTiles } from '../common/components/GameTileUtils';
import { getHydratedGameData } from './utils/gameSortUtils';
import GamesPageGameCarousel from '../gamesPage/components/GamesPageGameCarousel';
import { PageContext } from '../common/types/pageContext';
import SearchLandingPageGamesCarousel from '../searchLandingPage/SearchLandingPageCarousel';
import { searchLandingPage } from '../common/constants/configConstants';

type THomePageDiscoveryApiProps = {
  translate: WithTranslationsProps['translate'];
  sort: TGameSort;
  positionId: number;
  page: PageContext.HomePage | PageContext.GamesPage | PageContext.SearchLandingPage;
  itemsPerRow: number | undefined;
  startingRow: number | undefined;
  loadMoreGames?: () => void;
  isLoadingMoreGames?: boolean;
  isExpandHomeContentEnabled?: boolean;
  isChartsPageRenameEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
};

export const GameCarouselFeedItem = ({
  translate,
  sort,
  positionId,
  page,
  itemsPerRow,
  startingRow,
  loadMoreGames,
  isLoadingMoreGames,
  isExpandHomeContentEnabled,
  isChartsPageRenameEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled
}: THomePageDiscoveryApiProps): JSX.Element | null => {
  const friendsPresence = useFriendsPresence();

  const { contentMetadata } = useContentMetadata();

  // Enable carousel horizontal scroll and arrows on Home Event Tile carousels for all users
  const isCarouselScrollEnabled =
    isCarouselHorizontalScrollEnabled ||
    (page === PageContext.HomePage &&
      sort?.topicLayoutData?.componentType === TComponentType.EventTile);

  const isNewArrowsEnabled =
    isNewScrollArrowsEnabled ||
    (page === PageContext.HomePage &&
      sort?.topicLayoutData?.componentType === TComponentType.EventTile);

  const carouselData: TGameData[] = useMemo(() => {
    if (isCarouselScrollEnabled) {
      // Return all games, since scrolling is enabled
      return getHydratedGameData(sort, contentMetadata);
    }

    if (isExpandHomeContentEnabled) {
      return getHydratedGameData(sort, contentMetadata).slice(0, itemsPerRow);
    }

    return getHydratedGameData(sort, contentMetadata).slice(
      0,
      getNumCarouselTiles(page, sort.topicLayoutData?.componentType)
    );
  }, [
    sort,
    contentMetadata,
    page,
    itemsPerRow,
    isExpandHomeContentEnabled,
    isCarouselScrollEnabled
  ]);

  if (carouselData?.length === 0) {
    return null;
  }

  if (page === PageContext.GamesPage) {
    return (
      <GamesPageGameCarousel
        key={sort.topic}
        sort={sort}
        translate={translate}
        positionId={positionId}
        page={page}
        gameData={carouselData}
        loadMoreGames={loadMoreGames as () => void}
        isLoadingMoreGames={isLoadingMoreGames === true}
        tooltipInfoText={sort.topicLayoutData?.infoText}
        hideSeeAll={sort.topicLayoutData?.hideSeeAll === 'true'}
        componentType={sort.topicLayoutData?.componentType}
        playerCountStyle={sort.topicLayoutData?.playerCountStyle}
        playButtonStyle={sort.topicLayoutData?.playButtonStyle}
        subtitleLinkPath={sort.topicLayoutData?.subtitleLinkPath}
        itemsPerRow={itemsPerRow}
        isChartsPageRenameEnabled={isChartsPageRenameEnabled}
      />
    );
  }

  if (page === PageContext.SearchLandingPage) {
    return (
      <SearchLandingPageGamesCarousel
        key={sort.topic}
        sort={sort}
        gameData={carouselData}
        translate={translate}
        positionId={positionId}
        itemsPerRow={searchLandingPage.numberOfTilesPerCarousel}
      />
    );
  }

  return (
    <HomePageCarouselDiscoveryApi
      key={sort.topic}
      sort={sort}
      translate={translate}
      positionId={positionId}
      gameData={carouselData}
      friendsPresence={friendsPresence}
      itemsPerRow={itemsPerRow}
      startingRow={startingRow}
      componentType={sort.topicLayoutData?.componentType}
      playerCountStyle={sort.topicLayoutData?.playerCountStyle}
      playButtonStyle={sort.topicLayoutData?.playButtonStyle}
      hoverStyle={sort.topicLayoutData?.hoverStyle}
      tooltipInfoText={sort.topicLayoutData?.infoText}
      hideSeeAll={sort.topicLayoutData?.hideSeeAll === 'true'}
      navigationRootPlaceId={sort.topicLayoutData?.navigationRootPlaceId}
      isSponsoredFooterAllowed={sort.topicLayoutData?.isSponsoredFooterAllowed === 'true'}
      seeAllLinkPath={sort.topicLayoutData?.linkPath}
      subtitleLinkPath={sort.topicLayoutData?.subtitleLinkPath}
      endTimestamp={sort.topicLayoutData?.endTimestamp}
      countdownString={sort.topicLayoutData?.countdownString}
      isExpandHomeContentEnabled={isExpandHomeContentEnabled}
      isCarouselHorizontalScrollEnabled={isCarouselScrollEnabled}
      isNewScrollArrowsEnabled={isNewArrowsEnabled}
    />
  );
};

GameCarouselFeedItem.defaultProps = {
  loadMoreGames: undefined,
  isLoadingMoreGames: undefined,
  isExpandHomeContentEnabled: undefined,
  isChartsPageRenameEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  isNewScrollArrowsEnabled: undefined
};

export default GameCarouselFeedItem;
