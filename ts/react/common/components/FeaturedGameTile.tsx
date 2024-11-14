import React, { Ref, forwardRef, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-style-guide';
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGameIconSize,
  ThumbnailTypes
} from 'roblox-thumbnails';
import '../../../../css/common/_gameTiles.scss';
import useFocused from '../hooks/useFocused';
import useFriendsPresence from '../hooks/useFriendsPresence';
import useGetGameLayoutData from '../hooks/useGetGameLayoutData';
import bedev1Services from '../services/bedev1Services';
import { TGetPlaceDetails } from '../types/bedev1Types';
import { buildGameDetailUrl } from '../utils/browserUtils';
import { getInGameFriends } from '../utils/parsingUtils';
import { CreatorLabel } from './CreatorLabel';
import GameTileOverlayPill from './GameTileOverlayPill';
import GameTilePlayButtonV2 from './GameTilePlayButtonV2';
import {
  GameTileFriendsInGame,
  GameTileStats,
  GameTileTextFooter,
  TSharedGameTileProps
} from './GameTileUtils';
import { getGameTileTextFooterData } from '../utils/gameTileLayoutUtils';

export const FeaturedGridTile = forwardRef(
  (
    { id, buildEventProperties, gameData, translate, topicId }: TSharedGameTileProps,
    ref: Ref<HTMLDivElement>
  ): JSX.Element => {
    const [game, setGame] = useState<TGetPlaceDetails | undefined>();
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const friendsData = useFriendsPresence();
    const gameLayoutData = useGetGameLayoutData(gameData, topicId);

    const friendsDataInGame = useMemo(() => getInGameFriends(friendsData, gameData.universeId), [
      friendsData,
      gameData.universeId
    ]);

    const cardDescription = useMemo(() => {
      if (friendsDataInGame.length > 0 && game) {
        return (
          <GameTileFriendsInGame
            gameData={game}
            friendData={friendsDataInGame}
            translate={translate}
          />
        );
      }
      return (
        <div
          className='game-card-description-info font-body'
          data-testid='featured-grid-tile-description'>
          {game?.description}
        </div>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friendsDataInGame]);

    useEffect(() => {
      const fetchGameDetails = async () => {
        try {
          const response = await bedev1Services.getPlaceDetails(gameData.placeId.toString());
          setGame(response);
        } catch (e) {
          console.error(e);
        }
      };
      // eslint-disable-next-line no-void
      void fetchGameDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const linkUrl = buildGameDetailUrl(
      gameData.placeId,
      gameData.name,
      buildEventProperties(gameData, id)
    );

    const playButtonEventProperties = buildEventProperties(gameData, id) as Record<
      string,
      string | number | undefined
    >;

    const gameLayoutFooterData = getGameTileTextFooterData(gameLayoutData);

    return (
      <div
        ref={ref}
        className='featured-grid-item-container game-card-container'
        data-testid='game-tile-featured'
        onMouseOver={onFocus}
        onMouseLeave={onFocusLost}
        onFocus={onFocus}
        onBlur={onFocusLost}>
        <Link url={linkUrl} className='game-card-link' id={gameData.universeId.toString()}>
          <GameTileOverlayPill gameLayoutData={gameLayoutData} isFocused={isFocused} />
          <Thumbnail2d
            type={ThumbnailTypes.gameIcon}
            size={ThumbnailGameIconSize.size512}
            targetId={gameData.universeId}
            containerClass='game-card-thumb-container'
            format={ThumbnailFormat.jpeg}
            altName={gameData.name}
          />
          <div className='game-card-name-info'>
            <div>
              <div className='game-card-name game-name-title' title={gameData.name}>
                {gameData.name}
              </div>
              {gameLayoutFooterData ? (
                <GameTileTextFooter footerData={gameLayoutFooterData} />
              ) : (
                <GameTileStats
                  totalUpVotes={gameData.totalUpVotes}
                  totalDownVotes={gameData.totalDownVotes}
                  playerCount={gameData.playerCount}
                />
              )}
            </div>
            <GameTilePlayButtonV2
              universeId={gameData.universeId.toString()}
              placeId={gameData.placeId.toString()}
              playButtonEventProperties={playButtonEventProperties}
            />
          </div>
          {gameData.creatorName !== null && (
            <CreatorLabel
              universeId={gameData.universeId.toString()}
              creatorId={gameData.creatorId}
              creatorType={gameData.creatorType}
              creatorName={gameData.creatorName}
              isCreatorVerified={gameData.creatorHasVerifiedBadge ?? false}
              linkUrl={linkUrl}
              translate={translate}
            />
          )}
          {cardDescription}
        </Link>
      </div>
    );
  }
);
FeaturedGridTile.displayName = 'FeaturedGridTile';
export default FeaturedGridTile;
