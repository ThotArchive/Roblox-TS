import React, { useEffect, useState, useMemo } from 'react';
import { ExperimentationService } from 'Roblox';
import { EventContext } from '@rbx/unified-logging';
import { WithTranslationsProps, withTranslations, useTheme } from 'react-utilities';
import { CacheProvider, UIThemeProvider, createCache } from '@rbx/ui';
import realtimeService from '../services/realtimeService';
import friendsService from '../services/friendsService';
import chatService from '../services/chatService';
import { translationConfig } from '../translation.config';
import { TGetFriendsCountResponse, TFriend, TGetChatSettings } from '../types/friendsCarouselTypes';
import FriendsCarouselHeader from '../components/FriendsCarouselHeader';
import FriendsList from '../components/FriendsList';
import FriendCarouselNames from '../constants/friendCarouselNames';
import {
  mustHideConnectionsDueToAMP,
  isBlockingViewer
} from '../../../../js/react/friends/util/osaUtil';

const FRIENDSHIP_EVENT_TYPE = 'FriendshipNotifications';

const BADGING_EXPERIMENT_LAYER = 'Social.Friends';

const FULFILLED_PROMISE_STATUS = 'fulfilled';

interface ExperimentationConfig {
  isBadgeEnabled: boolean;
  isAddFriendsTileEnabledWeb: boolean;
}

interface RealtimeClient {
  Subscribe: (eventType: string, callback: () => any) => void;
  Unsubscribe: (eventType: string, callback: () => any) => void;
}

const allSettled = (promises: Promise<any>[]) => {
  return Promise.all(
    promises.map(p =>
      p.then((value: TGetFriendsCountResponse): { status: string; value: any } => ({
        status: FULFILLED_PROMISE_STATUS,
        value
      }))
    )
  );
};

const mustHideConnectionsCheck = async (profileUserId: number, isMyProfile: boolean) => {
  if (isMyProfile) {
    return false;
  }
  if (await isBlockingViewer(profileUserId)) {
    return true;
  }
  const mustHide: boolean = await mustHideConnectionsDueToAMP(profileUserId);
  return mustHide;
};

const FriendsCarouselContainer = ({
  translate,
  profileUserId,
  isOwnUser,
  carouselName,
  eventContext,
  homePageSessionInfo,
  sortId,
  sortPosition
}: {
  translate?: (key: string) => string;
  profileUserId: number;
  isOwnUser: boolean;
  carouselName: FriendCarouselNames;
  eventContext: EventContext;
  homePageSessionInfo: string | undefined;
  sortId: number | undefined;
  sortPosition: number | undefined;
} & WithTranslationsProps): JSX.Element => {
  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [friends, setFriends] = useState<TFriend[] | null>(null);
  const [canChat, setCanChat] = useState<boolean>(false);
  const [newFriendRequestsCount, setNewFriendRequestsCount] = useState<number | null>(null);
  const [showFriendsCarousel, setShowFriendsCarousel] = useState<boolean>(false);
  const [experimentationConfig, setExperimentationConfig] = useState<ExperimentationConfig>({
    isBadgeEnabled: false,
    isAddFriendsTileEnabledWeb: false
  });

  const cache = createCache();
  const theme = useTheme();

  const fetchExperimentationConfig = async (): Promise<ExperimentationConfig> => {
    if (ExperimentationService?.getAllValuesForLayer) {
      try {
        const ixpResult = await ExperimentationService.getAllValuesForLayer(
          BADGING_EXPERIMENT_LAYER
        );
        return {
          isBadgeEnabled: ixpResult?.enableNewFriendRequestsBadge === true,
          isAddFriendsTileEnabledWeb: ixpResult?.enableAddFriendsTileOnWeb === true
        };
      } catch (error) {
        console.error('Error fetching experimentation config:', error);
        return {
          isBadgeEnabled: false,
          isAddFriendsTileEnabledWeb: false
        };
      }
    }
    return {
      isBadgeEnabled: false,
      isAddFriendsTileEnabledWeb: false
    };
  };

  const getShouldShowFriendsCarousel = (
    hideConnections: boolean,
    name: FriendCarouselNames,
    friendCount: number,
    requestCount: number,
    isAddFriendsTileEnabledWeb: boolean
  ): boolean => {
    if (hideConnections) return false;

    if (name !== FriendCarouselNames.WebHomeFriendsCarousel) {
      return friendCount !== 0;
    }
    return friendCount !== 0 || (isAddFriendsTileEnabledWeb && requestCount !== 0);
  };

  // Listen to friend events if carousel is visible
  useEffect(() => {
    if (!showFriendsCarousel) return undefined;

    const handleFriendEvent = async () => {
      try {
        const count = await friendsService.getNewFriendRequestsCount();
        setNewFriendRequestsCount(count);
      } catch (error) {
        console.error('Error fetching friend request count:', error);
      }
    };
    // Subscribe to friending events
    const realTimeClient = realtimeService() as RealtimeClient;

    realTimeClient.Subscribe(FRIENDSHIP_EVENT_TYPE, handleFriendEvent);

    return () => {
      realTimeClient.Unsubscribe(FRIENDSHIP_EVENT_TYPE, handleFriendEvent);
    };
  }, [showFriendsCarousel]);

  useEffect(() => {
    const getData: () => Promise<void> = async () => {
      const promises = [
        friendsService.getFriendsCount(profileUserId),
        friendsService.getFriends(profileUserId, isOwnUser),
        chatService.getChatSettings(),
        friendsService.getNewFriendRequestsCount(),
        mustHideConnectionsCheck(profileUserId, isOwnUser),
        fetchExperimentationConfig()
      ];
      const [
        getFriendsCount,
        getFriends,
        getChatSettings,
        getNewFriendRequestsCount,
        mustHideFriends,
        experimentationConfigResult
      ] = await allSettled(promises);
      const friendsCountValue =
        getFriendsCount.status === FULFILLED_PROMISE_STATUS
          ? (getFriendsCount.value as TGetFriendsCountResponse).count
          : 0;
      const friendsValue =
        getFriends.status === FULFILLED_PROMISE_STATUS ? (getFriends.value as TFriend[]) : [];
      const chatEnabledValue =
        getChatSettings.status === FULFILLED_PROMISE_STATUS
          ? (getChatSettings.value as TGetChatSettings).chatEnabled
          : false;
      const newFriendRequestsCountValue =
        getNewFriendRequestsCount.status === FULFILLED_PROMISE_STATUS
          ? (getNewFriendRequestsCount.value as number)
          : 0;
      const experimentationConfigValue =
        experimentationConfigResult.status === FULFILLED_PROMISE_STATUS
          ? (experimentationConfigResult.value as ExperimentationConfig)
          : {
              isBadgeEnabled: false,
              isAddFriendsTileEnabledWeb: false
            };
      const mustHideConnections =
        mustHideFriends.status === FULFILLED_PROMISE_STATUS
          ? (mustHideFriends.value as boolean)
          : true;
      setFriendsCount(friendsCountValue);
      setFriends(friendsValue);
      setCanChat(chatEnabledValue);
      setNewFriendRequestsCount(newFriendRequestsCountValue);
      setExperimentationConfig(experimentationConfigValue);

      // Set the visibility of the friends carousel on load
      setShowFriendsCarousel(
        getShouldShowFriendsCarousel(
          mustHideConnections,
          carouselName,
          friendsCountValue,
          newFriendRequestsCountValue,
          experimentationConfigValue.isAddFriendsTileEnabledWeb
        )
      );
    };

    getData().catch(e => {
      throw e;
    });
  }, [profileUserId, isOwnUser]);

  return (
    <CacheProvider cache={cache}>
      <UIThemeProvider theme={theme} cssBaselineMode='disabled'>
        {!showFriendsCarousel ? (
          <div className='friends-carousel-0-friends' />
        ) : (
          <div className='react-friends-carousel-container'>
            <FriendsCarouselHeader
              friendsCount={friendsCount}
              translate={translate}
              profileUserId={profileUserId}
              isOwnUser={isOwnUser}
            />
            <FriendsList
              badgeCount={experimentationConfig.isBadgeEnabled ? newFriendRequestsCount ?? 0 : 0}
              friendsList={friends}
              translate={translate}
              isOwnUser={isOwnUser}
              canChat={canChat}
              carouselName={carouselName}
              eventContext={eventContext}
              homePageSessionInfo={homePageSessionInfo}
              sortId={sortId}
              sortPosition={sortPosition}
              isAddFriendsTileEnabled={experimentationConfig.isAddFriendsTileEnabledWeb}
            />
          </div>
        )}
      </UIThemeProvider>
    </CacheProvider>
  );
};

FriendsCarouselContainer.defaultProps = {
  translate: undefined
};

export default withTranslations(FriendsCarouselContainer, translationConfig);
