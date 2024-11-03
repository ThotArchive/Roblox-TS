import React, { useEffect, useState } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import friendsService from '../services/friendsService';
import chatService from '../services/chatService';
import { translationConfig } from '../translation.config';
import { TGetFriendsCountResponse, TFriend, TGetChatSettings } from '../types/friendsCarouselTypes';
import FriendsCarouselHeader from '../components/FriendsCarouselHeader';
import FriendsList from '../components/FriendsList';

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

const FriendsCarouselContainer = ({
  translate,
  profileUserId,
  isOwnUser
}: {
  translate?: (key: string) => string;
  profileUserId: number;
  isOwnUser: boolean;
} & WithTranslationsProps): JSX.Element => {
  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [friends, setFriends] = useState<TFriend[] | null>(null);
  const [canChat, setCanChat] = useState<boolean>(false);

  useEffect(() => {
    const getData: () => Promise<void> = async () => {
      const promises = [
        friendsService.getFriendsCount(profileUserId),
        friendsService.getFriends(profileUserId, isOwnUser),
        chatService.getChatSettings()
      ];
      const [getFriendsCount, getFriends, getChatSettings] = await allSettled(promises);
      const friendsCountValue = getFriendsCount.value as TGetFriendsCountResponse;
      const friendsValue = getFriends.value as TFriend[];
      const chatSettingsValue = getChatSettings.value as TGetChatSettings;

      setFriendsCount(getFriendsCount.status === 'fulfilled' ? friendsCountValue.count : 0);
      setFriends(getFriends.status === 'fulfilled' ? friendsValue : []);
      setCanChat(getChatSettings.status === 'fulfilled' ? chatSettingsValue.chatEnabled : false);
    };

    getData().catch(e => {
      throw e;
    });
  }, [profileUserId]);

  return friendsCount === 0 ? (
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
      />
    </div>
  );
};

FriendsCarouselContainer.defaultProps = {
  translate: undefined
};

export default withTranslations(FriendsCarouselContainer, translationConfig);
