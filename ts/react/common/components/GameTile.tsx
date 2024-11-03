import React, { Ref, forwardRef, useEffect, useMemo, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import '../../../../css/common/_gameTiles.scss';
import '../../../../css/gameCarousel/_tooltip.scss';
import useFocused from '../hooks/useFocused';
import bedev1Services from '../services/bedev1Services';
import { TGetFriendsResponse, TGetPlaceDetails } from '../types/bedev1Types';
import { THoverStyle } from '../types/bedev2Types';
import { PageContext } from '../types/pageContext';
import { useIconResolutionExperiment } from '../utils/IconResolutionExperimentContextProvider';
import { getInGameFriends } from '../utils/parsingUtils';
import {
  GameTileBase,
  GameTileFriendActivityFooter,
  GameTileFriendsInGame,
  GameTileSponsoredFooter,
  GameTileStats,
  TSharedGameTileProps
} from './GameTileUtils';

export type TGameTileProps = TSharedGameTileProps & {
  friendData?: TGetFriendsResponse[];
  className?: string;
  page?: PageContext;
  shouldShowMetadata?: boolean;
  isOnScreen?: boolean;
  isSponsoredFooterAllowed?: boolean;
  hoverStyle?: THoverStyle;
  translate: TranslateFunction;
};

export const GameTile = forwardRef<HTMLDivElement, TGameTileProps>(
  (
    {
      id,
      buildEventProperties,
      gameData,
      page = PageContext.HomePage,
      className = 'grid-item-container game-card-container',
      friendData = [],
      isOnScreen = true,
      shouldShowMetadata = true,
      isSponsoredFooterAllowed = false,
      topicId,
      translate
    }: TGameTileProps,
    ref: Ref<HTMLDivElement>
  ): JSX.Element => {
    const [gameDetails, setGameDetails] = useState<TGetPlaceDetails | undefined>();
    const [isFocused, onFocus, onFocusLost] = useFocused();

    const friendsInGame = useMemo(() => getInGameFriends(friendData, gameData.universeId), [
      friendData,
      gameData.universeId
    ]);

    const { shouldUseHigherResolutionIcon } = useIconResolutionExperiment();

    useEffect(() => {
      const fetchGameDetails = async () => {
        try {
          const response = await bedev1Services.getPlaceDetails(gameData.placeId.toString());
          setGameDetails(response);
        } catch (e) {
          console.error(e);
        }
      };
      if (gameDetails === undefined && friendsInGame.length > 0) {
        // eslint-disable-next-line no-void
        void fetchGameDetails();
      }
    }, [friendsInGame, gameDetails]);

    const getGameTileContent = (): JSX.Element => {
      if (!shouldShowMetadata) {
        return <React.Fragment />;
      }
      if (gameData?.isShowSponsoredLabel || (gameData?.isSponsored && isSponsoredFooterAllowed)) {
        return <GameTileSponsoredFooter translate={translate} />;
      }
      if (friendsInGame.length > 0 && gameDetails) {
        return <GameTileFriendsInGame friendData={friendsInGame} gameData={gameDetails} />;
      }
      if (gameData?.friendActivityTitle) {
        return <GameTileFriendActivityFooter footerText={gameData.friendActivityTitle} />;
      }
      return (
        <GameTileStats
          totalUpVotes={gameData.totalUpVotes}
          totalDownVotes={gameData.totalDownVotes}
          playerCount={gameData.playerCount}
        />
      );
    };

    return (
      <div
        ref={ref}
        className={className}
        data-testid='game-tile'
        onMouseOver={onFocus}
        onMouseLeave={onFocusLost}
        onFocus={onFocus}
        onBlur={onFocusLost}>
        <GameTileBase
          id={id}
          isOnScreen={isOnScreen}
          buildEventProperties={buildEventProperties}
          gameData={gameData}
          page={page}
          shouldUseHigherResolutionIcon={shouldUseHigherResolutionIcon}
          isFocused={isFocused}
          topicId={topicId}>
          {getGameTileContent()}
        </GameTileBase>
      </div>
    );
  }
);
GameTile.displayName = 'GameTile';
export default GameTile;
