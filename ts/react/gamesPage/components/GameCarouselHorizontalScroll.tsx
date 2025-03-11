import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { TGameData, TGetFriendsResponse } from '../../common/types/bedev1Types';
import { TBuildEventProperties } from '../../common/components/GameTileUtils';
import GameTileTypeMap from '../../common/components/GameTileTypeMap';
import ScrollArrows from './ScrollArrows';
import { PageContext } from '../../common/types/pageContext';
import configConstants from '../../common/constants/configConstants';
import { useHorizontalScrollTracker } from '../../common/components/useHorizontalScrollTracker';
import {
  TComponentType,
  TGameSort,
  TPlayerCountStyle,
  TPlayButtonStyle,
  THoverStyle
} from '../../common/types/bedev2Types';
import { getSortTargetId } from '../../omniFeed/utils/gameSortUtils';
import useElementWidthResizeObserver from '../../common/hooks/useElementWidthResizeObserver';

type TGamesPageGameCarouselProps = {
  gameData: TGameData[];
  sort: TGameSort;
  positionId: number;
  page: PageContext.GamesPage | PageContext.HomePage | PageContext.SearchLandingPage;
  // Type union will be cleaned up with isCarouselHorizontalScrollEnabled
  gamesContainerRef: React.RefObject<HTMLUListElement | HTMLDivElement>;
  buildEventProperties: TBuildEventProperties;
  loadMoreGames?: () => void;
  isLoadingMoreGames: boolean;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  itemsPerRow?: number;
  friendData?: TGetFriendsResponse[];
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  hoverStyle?: THoverStyle;
  topicId?: string;
  isExpandHomeContentEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
  hideScrollBackWhenDisabled?: boolean;
  translate: WithTranslationsProps['translate'];
  sortId: string | number;
};

const {
  numGameCarouselLookAheadWindows,
  gameTileGutterWidth,
  wideGameTileGutterWidth,
  scrollerWidth
} = configConstants.gamesPage;

const { wideTileHoverGrowWidthPx } = configConstants.common;

export const GameCarouselHorizontalScroll = ({
  gameData,
  sort,
  positionId,
  page,
  gamesContainerRef,
  buildEventProperties,
  loadMoreGames,
  isLoadingMoreGames,
  componentType,
  playerCountStyle,
  playButtonStyle,
  itemsPerRow,
  friendData,
  navigationRootPlaceId,
  isSponsoredFooterAllowed,
  hoverStyle,
  topicId,
  isExpandHomeContentEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled,
  hideScrollBackWhenDisabled,
  sortId,
  translate
}: TGamesPageGameCarouselProps): JSX.Element => {
  const tileRef = useRef<HTMLDivElement>(null);

  const [cursorIndex, setCursorIndex] = useState<number>(0);

  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  const [isScrollBackDisabled, setIsScrollBackDisabled] = useState<boolean>(true);
  const [isScrollForwardDisabled, setIsScrollForwardDisabled] = useState<boolean>(true);

  const [carouselLeftValue, setCarouselLeftValue] = useState<number>(0);

  const isWideTileCarousel = useMemo(() => {
    return componentType === TComponentType.GridTile || componentType === TComponentType.EventTile;
  }, [componentType]);

  const gameTileWidthOffset = useMemo(() => {
    return isWideTileCarousel ? wideGameTileGutterWidth : gameTileGutterWidth;
  }, [isWideTileCarousel]);

  const [carouselScrollRef, carouselScrollWidth] = useElementWidthResizeObserver();

  const [carouselWindowRef, carouselWindowWidth] = useElementWidthResizeObserver();

  const numGamesFitted = useMemo(() => {
    if (isWideTileCarousel && itemsPerRow) {
      return itemsPerRow;
    }

    const gameTileWidth = tileRef?.current?.getBoundingClientRect()?.width;

    if (carouselWindowWidth !== undefined && gameTileWidth !== undefined) {
      return Math.max(
        1,
        Math.floor(
          (carouselWindowWidth + gameTileWidthOffset) / (gameTileWidth + gameTileWidthOffset)
        )
      );
    }

    return 0;
  }, [carouselWindowWidth, gameTileWidthOffset, itemsPerRow, isWideTileCarousel]);

  useEffect(() => {
    if (carouselLeftValue >= 0) {
      setIsScrollBackDisabled(true);
    } else {
      setIsScrollBackDisabled(false);
    }

    if (isLoadingMoreGames) {
      setIsScrollForwardDisabled(true);
    } else if (
      carouselWindowWidth !== undefined &&
      carouselScrollWidth !== undefined &&
      // wideTileHoverGrowWidthPx is added as a hack because
      // hovering on a wide tile causes the carousel width to increase
      // by that many pixels, and therefore show the scroll forward arrow
      // ticket for fix: https://roblox.atlassian.net/browse/CLIGROW-1950
      Math.abs(carouselLeftValue) + carouselWindowWidth + wideTileHoverGrowWidthPx >=
        carouselScrollWidth
    ) {
      // Another scroll wouold be off the end of the games
      setIsScrollForwardDisabled(true);
    } else {
      setIsScrollForwardDisabled(false);
    }
  }, [
    carouselLeftValue,
    carouselWindowWidth,
    carouselScrollWidth,
    gameData?.length,
    isLoadingMoreGames
  ]);

  const checkLoadMoreGames = useCallback(() => {
    const lookAheadGames = numGameCarouselLookAheadWindows * numGamesFitted;

    if (cursorIndex + lookAheadGames >= gameData?.length && loadMoreGames && !isLoadingMoreGames) {
      loadMoreGames();
    }
  }, [cursorIndex, numGamesFitted, loadMoreGames, isLoadingMoreGames, gameData?.length]);

  const getScrollDistance = useCallback((): number => {
    const gameTileWidth = tileRef?.current?.getBoundingClientRect()?.width;

    if (gameTileWidth === undefined) {
      return 0;
    }

    return Math.floor(numGamesFitted) * (gameTileWidth + gameTileWidthOffset);
  }, [numGamesFitted, gameTileWidthOffset]);

  const onScrollToPrev = useCallback(() => {
    if (!isScrollBackDisabled) {
      const scrollDistance = getScrollDistance();

      setCarouselLeftValue(prevLeftValue => Math.min(prevLeftValue + scrollDistance, 0));
      setCursorIndex(prevCursorIndex => prevCursorIndex - numGamesFitted);
    }
  }, [getScrollDistance, isScrollBackDisabled, numGamesFitted]);

  const onScrollToNext = useCallback(() => {
    if (!isScrollForwardDisabled) {
      const scrollDistance = getScrollDistance();

      setCarouselLeftValue(prevLeftValue => {
        // Behind IXP, the carousel should not proceed past the game content
        // to avoid additional right gutter space on the last page
        if (isCarouselHorizontalScrollEnabled && page === PageContext.HomePage) {
          if (carouselScrollWidth !== undefined && carouselWindowWidth !== undefined) {
            return Math.max(
              prevLeftValue - scrollDistance,
              -1 * (carouselScrollWidth - carouselWindowWidth)
            );
          }

          return prevLeftValue - scrollDistance;
        }

        if (carouselScrollWidth !== undefined) {
          // If initially the scroll back button is hidden, we need to account for the scroller width
          // when its shown after the first scroll to next so the first game tile is fully shown in the window.
          const scrollerOffset: number =
            hideScrollBackWhenDisabled && isScrollBackDisabled ? scrollerWidth : 0;
          return (
            Math.max(prevLeftValue - scrollDistance, -1 * carouselScrollWidth) + scrollerOffset
          );
        }

        return prevLeftValue - scrollDistance;
      });
      setCursorIndex(prevCursorIndex => prevCursorIndex + numGamesFitted);

      checkLoadMoreGames();
    }
  }, [
    isScrollForwardDisabled,
    getScrollDistance,
    checkLoadMoreGames,
    isCarouselHorizontalScrollEnabled,
    page,
    carouselScrollWidth,
    carouselWindowWidth,
    hideScrollBackWhenDisabled,
    isScrollBackDisabled,
    numGamesFitted
  ]);

  const getIsGameOnScreen = useCallback(
    (gameIndex: number) => {
      return gameIndex >= cursorIndex && gameIndex < cursorIndex + numGamesFitted;
    },
    [cursorIndex, numGamesFitted]
  );

  const onScrollHandlerThrottled = useCallback(
    (onScrollHandler: () => void) => {
      if (!isScrolling) {
        setIsScrolling(true);
        onScrollHandler();
        setTimeout(() => {
          setIsScrolling(false);
        }, 200);
      }
    },
    [isScrolling]
  );

  const carouselContainerRef = useRef<HTMLDivElement>(null);
  useHorizontalScrollTracker({
    scrollPosition: -carouselLeftValue,
    page,
    gameSetTypeId: sortId,
    gameSetTargetId: getSortTargetId(sort),
    wrapperRef: carouselContainerRef,
    sortPosition: positionId
  });

  const listContainerClassName = useMemo(() => {
    return classNames({
      'hlist games game-cards game-tile-list': !isWideTileCarousel,
      'game-carousel wide-game-tile-carousel scrollable-carousel': isWideTileCarousel,
      'games-page-carousel': page === PageContext.GamesPage,
      'home-page-carousel': page === PageContext.HomePage
    });
  }, [isWideTileCarousel, page]);

  return (
    <div
      data-testid='game-carousel'
      ref={carouselContainerRef}
      className={classNames('horizontal-scroller games-list', {
        'home-page-games-list': page === PageContext.HomePage,
        'wide-game-tile-list': isWideTileCarousel,
        'expand-home-content': isExpandHomeContentEnabled,
        'expand-home-content-disabled': !isExpandHomeContentEnabled
      })}>
      <div ref={carouselWindowRef} className='clearfix horizontal-scroll-window'>
        <div
          ref={carouselScrollRef}
          className='horizontally-scrollable'
          style={{
            left: `${carouselLeftValue}px`
          }}>
          <ul
            // Type cast will be cleaned up with isCarouselHorizontalScrollEnabled
            ref={gamesContainerRef as React.RefObject<HTMLUListElement>}
            className={listContainerClassName}>
            {gameData.map((data, gameIndex) =>
              isWideTileCarousel ? (
                <GameTileTypeMap
                  key={data.universeId}
                  ref={tileRef}
                  id={gameIndex}
                  isOnScreen={getIsGameOnScreen(gameIndex)}
                  page={page}
                  gameData={data}
                  translate={translate}
                  buildEventProperties={buildEventProperties}
                  componentType={componentType}
                  playerCountStyle={playerCountStyle}
                  playButtonStyle={playButtonStyle}
                  hoverStyle={hoverStyle}
                  topicId={topicId}
                  friendData={friendData}
                  isSponsoredFooterAllowed={isSponsoredFooterAllowed}
                  navigationRootPlaceId={navigationRootPlaceId}
                />
              ) : (
                <li key={data.universeId} className='list-item game-card game-tile'>
                  <GameTileTypeMap
                    ref={tileRef}
                    id={gameIndex}
                    isOnScreen={getIsGameOnScreen(gameIndex)}
                    page={page}
                    gameData={data}
                    className='game-card-container'
                    translate={translate}
                    buildEventProperties={buildEventProperties}
                    componentType={componentType}
                    playerCountStyle={playerCountStyle}
                    playButtonStyle={playButtonStyle}
                    hoverStyle={hoverStyle}
                    topicId={topicId}
                    friendData={friendData}
                    isSponsoredFooterAllowed={isSponsoredFooterAllowed}
                    navigationRootPlaceId={navigationRootPlaceId}
                  />
                </li>
              )
            )}
          </ul>
        </div>
        <ScrollArrows
          hideScrollBackWhenDisabled={hideScrollBackWhenDisabled}
          isScrollBackDisabled={isScrollBackDisabled}
          isScrollForwardDisabled={isScrollForwardDisabled}
          onScrollBack={() => onScrollHandlerThrottled(onScrollToPrev)}
          onScrollForward={() => onScrollHandlerThrottled(onScrollToNext)}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
        />
      </div>
    </div>
  );
};

GameCarouselHorizontalScroll.defaultProps = {
  loadMoreGames: undefined,
  componentType: undefined,
  itemsPerRow: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  friendData: undefined,
  navigationRootPlaceId: undefined,
  isSponsoredFooterAllowed: undefined,
  hoverStyle: undefined,
  topicId: undefined,
  isExpandHomeContentEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  isNewScrollArrowsEnabled: undefined,
  hideScrollBackWhenDisabled: false
};

export default GameCarouselHorizontalScroll;
