import { useCallback } from 'react';
import { eventStreamService } from 'core-roblox-utilities';
import {
  parseEventParams,
  SessionInfo,
  SharedEventMetadata,
  ContentType,
  EventContext,
  ItemActionMetadata,
  UserActionMetadata,
  EventNames
} from '@rbx/unified-logging';
import type { TItemActionEventParams } from '@rbx/unified-logging';
import { TFriend } from '../types/friendsCarouselTypes';
import { getUserPresenceType } from '../utils/getUserPresenceType';
import FriendCarouselNames from '../constants/friendCarouselNames';

type TBuildItemActionEventProperties = () => TItemActionEventParams;

const useFriendsCarouselClickTracker = (
  friendData: TFriend,
  friendIndex: number,
  carouselName: FriendCarouselNames,
  eventContext: EventContext,
  homePageSessionInfo: string | undefined,
  sortId: number | undefined,
  sortPosition: number | undefined,
  totalNumberOfItems: number
): (() => void) => {
  const buildItemActionEventProperties: TBuildItemActionEventProperties = useCallback(() => {
    // Note that all indices are incremented to match the Universal App, which is 1-indexed
    return {
      [SharedEventMetadata.Context]: eventContext,
      [SharedEventMetadata.ContentType]: ContentType.User,
      [SharedEventMetadata.CollectionId]: sortId,
      [SharedEventMetadata.CollectionPosition]: sortPosition !== undefined ? sortPosition + 1 : -1,
      [ItemActionMetadata.TotalNumberOfItems]: totalNumberOfItems,
      [ItemActionMetadata.ActionType]: 'OpenProfile',
      [ItemActionMetadata.ItemId]: friendData.id.toString(),
      [ItemActionMetadata.ItemPosition]: friendIndex + 1,
      [ItemActionMetadata.PositionInTopic]: friendIndex + 1,
      // Friends Carousel is one row, so all items have a row number of 1
      [ItemActionMetadata.RowNumber]: 1,
      [UserActionMetadata.Presence]: getUserPresenceType(
        friendData.presence?.isOnline,
        friendData.presence?.isInGame,
        friendData.presence?.lastLocation
      ),
      [UserActionMetadata.PresenceUniverseId]: friendData.presence?.universeId ?? -1,
      [UserActionMetadata.FriendStatus]: 'friend',
      [UserActionMetadata.SourceCarousel]: carouselName,
      [SessionInfo.HomePageSessionInfo]: homePageSessionInfo
    };
  }, [
    friendData,
    friendIndex,
    homePageSessionInfo,
    sortId,
    sortPosition,
    carouselName,
    eventContext,
    totalNumberOfItems
  ]);

  const sendItemActionEvent = useCallback(() => {
    const params = buildItemActionEventProperties();

    eventStreamService.sendEvent(
      {
        name: EventNames.ItemAction,
        type: EventNames.ItemAction,
        context: eventContext
      },
      parseEventParams({ ...params })
    );
  }, [buildItemActionEventProperties, eventContext]);

  return sendItemActionEvent;
};

export default useFriendsCarouselClickTracker;
