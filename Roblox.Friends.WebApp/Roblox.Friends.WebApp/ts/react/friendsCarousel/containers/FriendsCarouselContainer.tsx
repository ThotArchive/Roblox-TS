import React, { useEffect, useState } from 'react';
import { EventContext } from '@rbx/unified-logging';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
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

const allSettled = (promises: Promise<any>[]) => {
  return Promise.all(
    promises.map(p =>
      p.then((value: TGetFriendsCountResponse): { status: string; value: any } => ({
        status: 'fulfilled',
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
  const [mustHideConnections, setMustHideConnections] = useState<boolean>(true);

  useEffect(() => {
    const getData: () => Promise<void> = async () => {
      const promises = [
        friendsService.getFriendsCount(profileUserId),
        friendsService.getFriends(profileUserId, isOwnUser),
        chatService.getChatSettings(),
        mustHideConnectionsCheck(profileUserId, isOwnUser)
      ];
      const [getFriendsCount, getFriends, getChatSettings, mustHideFriends] = await allSettled(
        promises
      );
      const friendsCountValue = getFriendsCount.value as TGetFriendsCountResponse;
      const friendsValue = getFriends.value as TFriend[];
      const chatSettingsValue = getChatSettings.value as TGetChatSettings;

      setFriendsCount(getFriendsCount.status === 'fulfilled' ? friendsCountValue.count : 0);
      setFriends(getFriends.status === 'fulfilled' ? friendsValue : []);
      setCanChat(getChatSettings.status === 'fulfilled' ? chatSettingsValue.chatEnabled : false);
      setMustHideConnections(mustHideFriends.status === 'fulfilled' ? mustHideFriends.value : true);
    };

    getData().catch(e => {
      throw e;
    });
  }, [profileUserId, isOwnUser]);

  return mustHideConnections || friendsCount === 0 ? (
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
        friendsList={friends}
        translate={translate}
        isOwnUser={isOwnUser}
        canChat={canChat}
        carouselName={carouselName}
        eventContext={eventContext}
        homePageSessionInfo={homePageSessionInfo}
        sortId={sortId}
        sortPosition={sortPosition}
      />
    </div>
  );
};

FriendsCarouselContainer.defaultProps = {
  translate: undefined
};

export default withTranslations(FriendsCarouselContainer, translationConfig);
