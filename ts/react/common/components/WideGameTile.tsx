import classNames from 'classnames';
import React, { Ref, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Link } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import configConstants from '../constants/configConstants';
import { FeaturePlacesList } from '../constants/translationConstants';
import useFocused from '../hooks/useFocused';
import bedev1Services from '../services/bedev1Services';
import {
  TGameData,
  TGetFriendsResponse,
  TLayoutComponentType,
  TLayoutMetadata
} from '../types/bedev1Types';
import {
  TComponentType,
  THoverStyle,
  TPlayButtonStyle,
  TPlayerCountStyle
} from '../types/bedev2Types';
import browserUtils from '../utils/browserUtils';
import { getFriendVisits, getInGameFriends } from '../utils/parsingUtils';
import GameTileOverlayPill from './GameTileOverlayPill';
import GameTilePlayButton from './GameTilePlayButton';
import {
  GameTileIconWithTextFooter,
  GameTileRatingFooter,
  GameTileStats,
  GameTileTextFooter,
  TBuildEventProperties,
  WideGameTileFacepileFooter,
  WideGameTileSponsoredFooter
} from './GameTileUtils';
import WideGameThumbnail from './WideGameThumbnail';
import useGetGameLayoutData from '../hooks/useGetGameLayoutData';
import { getGameTileTextFooterData } from '../utils/gameTileLayoutUtils';

const WideGameTileLinkWrapper = ({
  wrapperClassName,
  isTileClickEnabled,
  isOnScreen,
  linkUrl,
  children
}: {
  wrapperClassName: string;
  isTileClickEnabled: boolean;
  isOnScreen: boolean;
  linkUrl: string;
  children: React.ReactNode;
}) => {
  if (isTileClickEnabled) {
    return (
      <Link url={linkUrl} className={wrapperClassName} tabIndex={isOnScreen ? 0 : -1}>
        {children}
      </Link>
    );
  }

  return <span className={wrapperClassName}>{children}</span>;
};

export type TWideGameTileProps = {
  gameData: TGameData;
  id: number;
  buildEventProperties: TBuildEventProperties;
  friendData?: TGetFriendsResponse[];
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  wideTileType: TComponentType.GridTile | TComponentType.EventTile | TComponentType.InterestTile;
  hoverStyle?: THoverStyle;
  topicId?: string;
  isOnScreen?: boolean;
  isInterestedUniverse?: boolean;
  toggleInterest?: () => void;
  translate: TranslateFunction;
};

const WideGameTile = React.forwardRef(
  (
    {
      gameData,
      id,
      buildEventProperties,
      friendData = [],
      playerCountStyle,
      playButtonStyle,
      navigationRootPlaceId,
      isSponsoredFooterAllowed = false,
      wideTileType,
      hoverStyle,
      topicId,
      isOnScreen = true,
      isInterestedUniverse = undefined,
      toggleInterest = undefined,
      translate
    }: TWideGameTileProps,
    ref: Ref<HTMLDivElement>
  ) => {
    const isFirstTile = id === 0;
    const isLastTile = id === configConstants.homePage.maxWideGameTilesPerCarouselPage - 1;
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const [referralPlaceId, setReferralPlaceId] = useState<number>(gameData.placeId);

    useEffect(() => {
      if (navigationRootPlaceId && !Number.isNaN(navigationRootPlaceId)) {
        setReferralPlaceId(parseInt(navigationRootPlaceId, 10));
      } else if (gameData.navigationUid) {
        // Fetch the place ID to navigate to for this universe ID
        bedev1Services
          .getGameDetails(gameData.navigationUid)
          .then(data => {
            if (data?.rootPlaceId) {
              setReferralPlaceId(data.rootPlaceId);
            }
          })
          .catch(() => {
            // non-blocking, as we will fallback to gameData.placeId
          });
      }
    }, [navigationRootPlaceId, gameData.navigationUid]);

    const clientReferralUrl = useMemo(() => {
      return browserUtils.buildGameDetailUrl(
        referralPlaceId,
        gameData.name,
        buildEventProperties(gameData, id)
      );
    }, [gameData, buildEventProperties, id, referralPlaceId]);

    const playButtonEventProperties = buildEventProperties(gameData, id) as Record<
      string,
      string | number | undefined
    >;

    const friendsInGame = useMemo(() => getInGameFriends(friendData, gameData.universeId), [
      friendData,
      gameData.universeId
    ]);

    const friendVisits = useMemo(() => getFriendVisits(friendData, gameData.friendVisits), [
      friendData,
      gameData.friendVisits
    ]);

    const gameLayoutData = useGetGameLayoutData(gameData, topicId);

    const getHoverTileMetadata = (): JSX.Element | null => {
      if (
        gameData.minimumAge &&
        gameData.ageRecommendationDisplayName &&
        wideTileType !== TComponentType.EventTile
      ) {
        return (
          <div className='game-card-info' data-testid='game-tile-hover-age-rating'>
            <span className='info-label'>{gameData.ageRecommendationDisplayName}</span>
          </div>
        );
      }
      return null;
    };

    const getBaseTileMetadata = (): JSX.Element => {
      const hoverTileMetadata = getHoverTileMetadata();
      if (isFocused && hoverStyle === THoverStyle.imageOverlay && hoverTileMetadata) {
        return hoverTileMetadata;
      }
      if (gameData.isShowSponsoredLabel || (gameData.isSponsored && isSponsoredFooterAllowed)) {
        return <WideGameTileSponsoredFooter translate={translate} />;
      }
      const gameLayoutFooterData = getGameTileTextFooterData(gameLayoutData);
      if (gameLayoutFooterData) {
        return <GameTileTextFooter footerData={gameLayoutFooterData} />;
      }
      if (friendsInGame?.length > 0) {
        return <WideGameTileFacepileFooter friendsData={friendsInGame} isOnline />;
      }
      if (friendVisits?.length > 0) {
        return <WideGameTileFacepileFooter friendsData={friendVisits} isOnline={false} />;
      }
      if (gameData.friendVisitedString) {
        return (
          <GameTileIconWithTextFooter
            iconClassName='icon-pastname'
            text={gameData.friendVisitedString}
          />
        );
      }
      if (playerCountStyle === TPlayerCountStyle.Footer) {
        return (
          <GameTileStats
            totalUpVotes={gameData.totalUpVotes}
            totalDownVotes={gameData.totalDownVotes}
            playerCount={gameData.playerCount}
          />
        );
      }
      return (
        <GameTileRatingFooter
          totalUpVotes={gameData.totalUpVotes}
          totalDownVotes={gameData.totalDownVotes}
          translate={translate}
        />
      );
    };

    const getGameTileMetadata = (): JSX.Element => {
      return (
        <div className='wide-game-tile-metadata'>
          <div className='base-metadata'>{getBaseTileMetadata()}</div>
          <div className='hover-metadata'>{getHoverTileMetadata()}</div>
        </div>
      );
    };

    const showPlayButton = (): boolean => {
      if (
        wideTileType === TComponentType.GridTile &&
        playButtonStyle === TPlayButtonStyle.Disabled
      ) {
        return false;
      }
      if (
        wideTileType === TComponentType.EventTile &&
        playButtonStyle !== TPlayButtonStyle.Enabled
      ) {
        return false;
      }
      // InterestTiles are only presentational, so we hide the play button
      if (wideTileType === TComponentType.InterestTile) {
        return false;
      }
      return true;
    };

    const gameTitle = useMemo((): string => {
      if (gameLayoutData?.title) {
        return gameLayoutData.title;
      }

      return gameData.name;
    }, [gameData.name, gameLayoutData?.title]);

    // InterestTiles are only presentational, so we disable clicks and hover states
    const isTileClickEnabled = wideTileType !== TComponentType.InterestTile;
    const isHoverEnabled = wideTileType !== TComponentType.InterestTile;

    const onInterestButtonClick = useCallback(() => {
      if (toggleInterest) {
        toggleInterest();
      }
    }, [toggleInterest]);

    return (
      <li
        className={classNames(
          'list-item',
          'hover-game-tile',
          { 'grid-tile': wideTileType === TComponentType.GridTile },
          { 'event-tile': wideTileType === TComponentType.EventTile },
          { 'interest-tile': wideTileType === TComponentType.InterestTile },
          { 'first-tile': isFirstTile },
          { 'last-tile': isLastTile },
          { 'image-overlay': hoverStyle === THoverStyle.imageOverlay },
          { 'old-hover': hoverStyle !== THoverStyle.imageOverlay },
          { focused: isFocused }
        )}
        data-testid='wide-game-tile'
        onMouseOver={isHoverEnabled ? onFocus : undefined}
        onMouseLeave={isHoverEnabled ? onFocusLost : undefined}
        onFocus={isHoverEnabled ? onFocus : undefined}
        onBlur={isHoverEnabled ? onFocusLost : undefined}
        id={gameData.universeId.toString()}>
        {gameData.universeId && (
          <div className='featured-game-container game-card-container' ref={ref}>
            <WideGameTileLinkWrapper
              wrapperClassName='game-card-link'
              isTileClickEnabled={isTileClickEnabled}
              isOnScreen={isOnScreen}
              linkUrl={clientReferralUrl}>
              <div className='featured-game-icon-container'>
                <WideGameThumbnail
                  gameData={gameData}
                  topicId={topicId}
                  wideTileType={wideTileType}
                />
                <GameTileOverlayPill
                  gameLayoutData={gameLayoutData}
                  playerCountStyle={playerCountStyle}
                  playerCount={gameData.playerCount}
                  isFocused={isFocused}
                />
              </div>
              <div className='info-container'>
                <div className='info-metadata-container'>
                  <div
                    className='game-card-name game-name-title'
                    data-testid='game-tile-game-title'
                    title={gameTitle}>
                    {gameTitle}
                  </div>
                  {getGameTileMetadata()}
                </div>
                {isFocused && hoverStyle === THoverStyle.imageOverlay && showPlayButton() && (
                  <div
                    data-testid='game-tile-hover-game-tile-contents'
                    className='play-button-container'>
                    <GameTilePlayButton
                      universeId={gameData.universeId.toString()}
                      placeId={gameData.placeId.toString()}
                      playButtonEventProperties={playButtonEventProperties}
                      buttonClassName='btn-growth-xs play-button'
                      purchaseIconClassName='icon-robux-white'
                      clientReferralUrl={clientReferralUrl}
                      shouldPurchaseNavigateToDetails
                    />
                  </div>
                )}
              </div>
            </WideGameTileLinkWrapper>
            {isFocused && hoverStyle !== THoverStyle.imageOverlay && showPlayButton() && (
              <div data-testid='game-tile-hover-game-tile-contents' className='game-card-contents'>
                <GameTilePlayButton
                  universeId={gameData.universeId.toString()}
                  placeId={gameData.placeId.toString()}
                  playButtonEventProperties={playButtonEventProperties}
                  buttonClassName='btn-growth-xs play-button'
                  purchaseIconClassName='icon-robux-white'
                  clientReferralUrl={clientReferralUrl}
                  shouldPurchaseNavigateToDetails
                />
              </div>
            )}
            {wideTileType === TComponentType.InterestTile && (
              <Button
                data-testid='tile-interest-button'
                className='tile-interest-button'
                variant={Button.variants.primary}
                size={Button.sizes.medium}
                title={translate(FeaturePlacesList.ActionInterestCatcherInterested)}
                onClick={onInterestButtonClick}>
                {isInterestedUniverse ? (
                  <span className='icon-heart-red' />
                ) : (
                  <span className='icon-heart' />
                )}
                <span>{translate(FeaturePlacesList.ActionInterestCatcherInterested)}</span>
              </Button>
            )}
          </div>
        )}
      </li>
    );
  }
);

WideGameTile.displayName = 'WideGameTile';
export default WideGameTile;
