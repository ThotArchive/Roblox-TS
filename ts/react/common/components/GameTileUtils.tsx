import React, { useState } from 'react';
import { Modal, Link } from 'react-style-guide';
import { TranslateFunction, WithTranslationsProps, withTranslations } from 'react-utilities';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameIconSize,
  ThumbnailAvatarHeadshotSize
} from 'roblox-thumbnails';
import classNames from 'classnames';
import parsingUtils, { GAME_STATS_PLACEHOLDER_STRING } from '../utils/parsingUtils';
import browserUtils from '../utils/browserUtils';
import { common, homePage } from '../constants/configConstants';
import { CommonGameSorts, FeatureGamePage } from '../constants/translationConstants';
import { TGameDetailReferral } from '../constants/eventStreamConstants';
import {
  TGameData,
  TGetPlaceDetails,
  TGetFriendsResponse,
  TGameTileTextFooter
} from '../types/bedev1Types';
import { TComponentType, TTreatmentType } from '../types/bedev2Types';
import PlayerInteractionModal from '../../../../js/react/gamePlayers/containers/PlayerInteractionModal';
import placesListTranslationConfig from '../../homePage/translation.config';
import '../../../../css/common/_gameTiles.scss';
import { PageContext } from '../types/pageContext';
import GamesInfoTooltip from './GamesInfoTooltip';
import {
  tileDisplayConfig,
  tileDisplayConfigExperimental,
  defaultTileDisplayConfig,
  fractionalCarouselScrollPeek
} from '../constants/tileDisplayConfigConstants';
import useGetGameLayoutData from '../hooks/useGetGameLayoutData';
import GameTileOverlayPill from './GameTileOverlayPill';

const gameIconSize = 32;
const gameIconOverlap = 10;
const { keyBoardEventCode, numberOfInGameAvatarIcons, numberOfInGameNames } = common;
export type TBuildEventProperties = (gameData: TGameData, id: number) => TGameDetailReferral;
export type TSharedGameTileProps = {
  id: number;
  translate: WithTranslationsProps['translate'];
  buildEventProperties: TBuildEventProperties;
  gameData: TGameData;
  topicId?: string;
};

export const GameTileBase = ({
  id,
  children,
  gameData,
  isOnScreen,
  page,
  buildEventProperties,
  isFocused,
  topicId
}: Omit<TSharedGameTileProps, 'translate'> & {
  children: JSX.Element;
  page?: PageContext;
  isOnScreen?: boolean;
  isFocused?: boolean;
}): JSX.Element => {
  const iconSize = ThumbnailGameIconSize.size256;

  const gameLayoutData = useGetGameLayoutData(gameData, topicId);

  return (
    <Link
      url={browserUtils.buildGameDetailUrl(
        gameData.placeId,
        gameData.name,
        buildEventProperties(gameData, id)
      )}
      tabIndex={isOnScreen ? 0 : -1}
      aria-hidden={!isOnScreen}
      className='game-card-link'
      id={gameData.universeId.toString()}>
      <GameTileOverlayPill gameLayoutData={gameLayoutData} isFocused={!!isFocused} />
      {page === PageContext.GamesPage ? (
        <div className='game-card-thumb-container'>
          <Thumbnail2d
            type={ThumbnailTypes.gameIcon}
            size={iconSize}
            targetId={gameData.universeId}
            containerClass='game-card-thumb'
            format={ThumbnailFormat.jpeg}
            altName={gameData.name}
          />
        </div>
      ) : (
        <Thumbnail2d
          type={ThumbnailTypes.gameIcon}
          size={iconSize}
          targetId={gameData.universeId}
          containerClass='game-card-thumb-container'
          format={ThumbnailFormat.jpeg}
          altName={gameData.name}
        />
      )}

      <div className='game-card-name game-name-title' title={gameData.name}>
        {gameData.name}
      </div>
      {children}
    </Link>
  );
};

GameTileBase.defaultProps = {
  page: PageContext.HomePage,
  isOnScreen: true,
  isFocused: false
};

export const GameTileStats = ({
  totalDownVotes,
  totalUpVotes,
  playerCount
}: {
  totalUpVotes: number;
  totalDownVotes: number;
  playerCount: number;
}): JSX.Element => {
  const votes = parsingUtils.getVotePercentage(totalUpVotes, totalDownVotes);
  const players = parsingUtils.getPlayerCount(playerCount);
  return (
    <div className='game-card-info' data-testid='game-tile-stats'>
      <span className='info-label icon-votes-gray' />
      {!votes ? (
        <span className='info-label no-vote' />
      ) : (
        <span className='info-label vote-percentage-label'>{votes}</span>
      )}
      <span className='info-label icon-playing-counts-gray' />
      <span className='info-label playing-counts-label'>{players}</span>
    </div>
  );
};

export const GameTileRatingFooter = ({
  totalDownVotes,
  totalUpVotes,
  translate
}: {
  totalUpVotes: number;
  totalDownVotes: number;
  translate: TranslateFunction;
}): JSX.Element => {
  const { RatingPercentageText } = common;

  const votes = parsingUtils.getVotePercentageValue(totalUpVotes, totalDownVotes);
  const voteDisplayValue = votes?.toString() || GAME_STATS_PLACEHOLDER_STRING;
  return (
    <div className='game-card-info' data-testid='game-tile-stats-rating'>
      <span className='info-label icon-votes-gray' />
      <span className='info-label vote-percentage-label'>
        {translate(RatingPercentageText, { percentRating: voteDisplayValue }) ||
          `${voteDisplayValue}% Rating`}
      </span>
    </div>
  );
};

export const GameTileTextFooter = ({
  footerData
}: {
  footerData: TGameTileTextFooter;
}): JSX.Element => {
  return (
    <div className='game-card-info' data-testid='game-tile-stats-text-footer'>
      <span className='info-label'>{footerData.text.textLiteral}</span>
    </div>
  );
};

export const GameTileIconWithTextFooter = ({
  iconClassName,
  text
}: {
  iconClassName: string;
  text: string;
}): JSX.Element => {
  return (
    <div className='game-card-info' data-testid='game-tile-stats-icon-text-footer'>
      <span className={classNames('info-label', iconClassName)} />
      <span className='info-label text-label-with-icon'>{text}</span>
    </div>
  );
};

export const GameTileFriendActivityFooter = ({
  footerText
}: {
  footerText: string;
}): JSX.Element => {
  return (
    <div className='game-card-info' data-testid='game-tile-stats-friend-activity'>
      <span className='info-label'>{footerText}</span>
    </div>
  );
};

export const GameTileSponsoredFooter = ({
  translate
}: {
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  return (
    <div className='game-card-native-ad' data-testid='game-tile-sponsored-footer'>
      <div className='native-ad-label'>
        {translate(FeatureGamePage.LabelSponsoredAd)}
        <GamesInfoTooltip
          tooltipText={
            translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
            'Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics.'
          }
          sizeInPx={12}
        />
      </div>
    </div>
  );
};

const GameTileAvatarThumbnail = ({ user }: { user: TGetFriendsResponse }): JSX.Element => {
  return (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={ThumbnailAvatarHeadshotSize.size48}
      targetId={user.id}
      containerClass='avatar avatar-headshot avatar-headshot-xs'
      imgClassName='avatar-card-image'
      format={ThumbnailFormat.webp}
      altName={user.displayName}
    />
  );
};

export const WideGameTileSponsoredFooter = ({
  translate
}: {
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  return (
    <div className='game-card-info' data-testid='wide-game-tile-sponsored-footer'>
      <GamesInfoTooltip
        tooltipText={
          translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
          'Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics.'
        }
        sizeInPx={12}
      />
      <span className='info-label text-label-with-icon'>
        {translate(FeatureGamePage.LabelSponsoredAd)}
      </span>
    </div>
  );
};

const GameTileFacepile = ({
  friendsData,
  isOnline
}: {
  friendsData: TGetFriendsResponse[];
  isOnline: boolean;
}): JSX.Element => {
  const { maxFacepileFriendCountValue } = common;

  const getCoverCountText = (): string => {
    if (friendsData?.length > maxFacepileFriendCountValue) {
      return `${maxFacepileFriendCountValue.toString()}+`;
    }
    if (friendsData?.length > numberOfInGameAvatarIcons) {
      return friendsData?.length.toString();
    }
    return '';
  };

  const coverCountText = getCoverCountText();

  const numIconsToShow = coverCountText ? numberOfInGameAvatarIcons - 1 : numberOfInGameAvatarIcons;

  const avatarCardClassName = classNames('avatar-card', {
    'avatar-card-online': isOnline
  });

  return (
    <div className='info-avatar'>
      {coverCountText && (
        <div className={avatarCardClassName}>
          <div className='avatar-count-container'>
            <span className='avatar-count info-label'>{coverCountText}</span>
          </div>
        </div>
      )}
      {friendsData.slice(0, numIconsToShow).map(friend => (
        <div className={avatarCardClassName} key={friend.displayName}>
          <GameTileAvatarThumbnail user={friend} />
        </div>
      ))}
    </div>
  );
};

export const WideGameTileFacepileFooter = ({
  friendsData,
  isOnline
}: {
  friendsData: TGetFriendsResponse[];
  isOnline: boolean;
}): JSX.Element => {
  if (friendsData.length === 0) {
    throw new Error('friendData should not be empty');
  }

  const getTileFooterFriendsText = (): string => {
    return friendsData.map(friend => friend.displayName).join(', ');
  };

  return (
    <div
      className='game-card-info'
      data-testid={`game-tile-stats-${isOnline ? 'online' : 'offline'}-friends-facepile`}>
      <GameTileFacepile friendsData={friendsData} isOnline={isOnline} />
      <span className='info-label'>{getTileFooterFriendsText()}</span>
    </div>
  );
};

export const GameTileFriendsInGame = ({
  friendData,
  gameData,
  translate
}: {
  friendData: TGetFriendsResponse[];
  gameData: TGetPlaceDetails;
  translate?: WithTranslationsProps['translate'];
}): JSX.Element => {
  const [isModalShown, setModalShown] = useState(false);

  if (friendData.length === 0) {
    throw new Error('friendData should not be empty');
  }

  return (
    <div className='game-card-friend-info game-card-info' data-testid='game-tile-stats-friends'>
      <div
        className='info-avatar'
        style={{
          width: `${
            (friendData.slice(0, numberOfInGameAvatarIcons).length - 1) *
              (gameIconSize - gameIconOverlap) +
            gameIconSize
          }px`
        }}>
        {friendData.slice(0, numberOfInGameAvatarIcons).map(friend => (
          <div
            className='avatar-card'
            role='button'
            tabIndex={0}
            key={friend.displayName}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              setModalShown(true);
            }}
            onKeyDown={e => {
              if (e.code === keyBoardEventCode.enter) {
                e.stopPropagation();
                e.preventDefault();
                setModalShown(true);
              }
            }}>
            <GameTileAvatarThumbnail user={friend} />
          </div>
        ))}
      </div>
      {translate && (
        <span className='info-label text-overflow' data-testid='game-tile-stats-info-label'>
          {friendData.length > numberOfInGameNames
            ? translate(FeatureGamePage.LabelPlayingOnePlusUsersWithComma, {
                username: friendData[0].displayName,
                count: friendData.length - numberOfInGameNames
              })
            : translate(FeatureGamePage.LabelPlayingOneUser, {
                user: friendData[0].displayName
              })}
        </span>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      <ShimmedPlayerInteractionModal
        friendsDataInGame={friendData}
        game={gameData}
        show={isModalShown}
        onHide={e => {
          e.stopPropagation();
          e.preventDefault();
          setModalShown(false);
        }}
      />
    </div>
  );
};

GameTileFriendsInGame.defaultProps = {
  translate: undefined
};

type TShimmedPlayerInteractionModalComponentProps = {
  show: boolean;
  onHide: (e: Event) => void;
  friendsDataInGame: TGetFriendsResponse[];
  game: TGetPlaceDetails;
};

export const ShimmedPlayerInteractionModalComponent = ({
  show,
  onHide,
  friendsDataInGame,
  game,
  translate
}: TShimmedPlayerInteractionModalComponentProps & WithTranslationsProps): JSX.Element => (
  <Modal show={show} onHide={onHide} size='lg'>
    <PlayerInteractionModal
      friendsData={friendsDataInGame.map(friend => {
        return { ...friend, nameForDisplay: friend.displayName };
      })}
      friendsInGame={friendsDataInGame.map(friend => friend.id)}
      game={game}
      dismissModal={onHide}
      translate={translate}
    />
  </Modal>
);

export const ShimmedPlayerInteractionModal = withTranslations<TShimmedPlayerInteractionModalComponentProps>(
  ShimmedPlayerInteractionModalComponent,
  placesListTranslationConfig
);

export const getNumCarouselTiles = (
  page: PageContext.HomePage | PageContext.GamesPage,
  componentType: TComponentType | undefined
): number | undefined => {
  const { maxWideGameTilesPerCarouselPage, maxTilesPerCarouselPage } = homePage;

  if (page === PageContext.GamesPage) {
    return undefined;
  }

  switch (componentType) {
    case TComponentType.GridTile:
    case TComponentType.EventTile:
    case TComponentType.InterestTile:
      return maxWideGameTilesPerCarouselPage;
    case TComponentType.AppGameTileNoMetadata:
    default:
      return maxTilesPerCarouselPage;
  }
};

export const getNumTilesPerRow = (
  feedWidth: number | undefined,
  containerBufferWidth: number,
  componentType: TComponentType | undefined,
  isCarouselHorizontalScrollEnabled?: boolean,
  treatmentType?: TTreatmentType,
  numTilesInSort?: number
): number => {
  const displayConfigTable = isCarouselHorizontalScrollEnabled
    ? tileDisplayConfigExperimental
    : tileDisplayConfig;
  const displayConfig = componentType
    ? displayConfigTable[componentType]
    : defaultTileDisplayConfig;

  if (!feedWidth) {
    return displayConfig.minTilesPerRow;
  }

  const { minTileWidth, columnGap, minTilesPerRow, maxTilesPerRow } = displayConfig;

  const numItemsFit = Math.floor(
    (feedWidth - containerBufferWidth + columnGap) / (minTileWidth + columnGap)
  );

  const itemsPerRow = Math.min(maxTilesPerRow, Math.max(minTilesPerRow, numItemsFit));

  // Enable fractional scroll tile peek for carousels with more tiles than currently displayed
  if (
    isCarouselHorizontalScrollEnabled &&
    treatmentType === TTreatmentType.Carousel &&
    numTilesInSort !== undefined &&
    numTilesInSort > itemsPerRow
  ) {
    return itemsPerRow + fractionalCarouselScrollPeek;
  }

  return itemsPerRow;
};

export default {
  ShimmedPlayerInteractionModal,
  GameTileFriendsInGame,
  GameTileStats,
  GameTileBase
};
