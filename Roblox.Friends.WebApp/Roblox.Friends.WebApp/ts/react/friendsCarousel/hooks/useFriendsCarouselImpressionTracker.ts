import { RefObject, useCallback } from 'react';
import { eventStreamService } from 'core-roblox-utilities';
import { fireEvent } from 'roblox-event-tracker';
import {
  useCollectionItemsIntersectionTracker,
  parseEventParams,
  SessionInfo,
  SharedEventMetadata,
  ItemImpressionsMetadata,
  UserImpressionsMetadata,
  ContentType,
  EventContext,
  FriendStatus,
  EventNames
} from '@rbx/unified-logging';
import type { TItemImpressionsEventParams } from '@rbx/unified-logging';
import { TFriend } from '../types/friendsCarouselTypes';
import { getUserPresenceType } from '../utils/getUserPresenceType';
import FriendCarouselNames from '../constants/friendCarouselNames';

type TBuildItemImpressionsEventProperties = (
  impressedIndexes: number[]
) => TItemImpressionsEventParams | undefined;

const useFriendsCarouselImpressionTracker = (
  containerRef: RefObject<HTMLDivElement | null>,
  friendsList: TFriend[] | null,
  carouselName: FriendCarouselNames,
  eventContext: EventContext,
  homePageSessionInfo: string | undefined,
  sortId: number | undefined,
  sortPosition: number | undefined
): void => {
  const buildItemImpressionsProperties: TBuildItemImpressionsEventProperties = useCallback(
    (impressedIndexes: number[]) => {
      if (friendsList) {
        const filteredImpressedIndexes = impressedIndexes.filter(
          index => index < friendsList.length
        );

        // Note that all indices are incremented to match the Universal App, which is 1-indexed
        return {
          [SharedEventMetadata.Context]: eventContext,
          [SharedEventMetadata.ContentType]: ContentType.User,
          [SharedEventMetadata.CollectionId]: sortId,
          [SharedEventMetadata.CollectionPosition]:
            sortPosition !== undefined ? sortPosition + 1 : -1,
          [ItemImpressionsMetadata.TotalNumberOfItems]: friendsList.length,

          [ItemImpressionsMetadata.ItemIds]: filteredImpressedIndexes.map(
            index => friendsList[index]?.id?.toString() ?? '-1'
          ),
          [ItemImpressionsMetadata.ItemPositions]: filteredImpressedIndexes.map(index => index + 1),
          [ItemImpressionsMetadata.PositionsInTopic]: filteredImpressedIndexes.map(
            index => index + 1
          ),
          // Friends Carousel is one row, so all items have a row number of 1
          [ItemImpressionsMetadata.RowNumbers]: filteredImpressedIndexes.map(() => 1),

          [UserImpressionsMetadata.Presences]: filteredImpressedIndexes.map(index =>
            getUserPresenceType(
              friendsList[index]?.presence?.isOnline,
              friendsList[index]?.presence?.isInGame,
              friendsList[index]?.presence?.lastLocation
            )
          ),
          [UserImpressionsMetadata.PresenceUniverseIds]: filteredImpressedIndexes.map(
            index => friendsList[index]?.presence?.universeId ?? -1
          ),
          [UserImpressionsMetadata.FriendStatuses]: filteredImpressedIndexes.map(
            () => FriendStatus.Friend
          ),
          [UserImpressionsMetadata.SourceCarousel]: carouselName,

          [SessionInfo.HomePageSessionInfo]: homePageSessionInfo
        };
      }

      return undefined;
    },
    [friendsList, homePageSessionInfo, sortId, sortPosition, carouselName, eventContext]
  );

  const sendItemImpressions = useCallback(
    (indexesToSend: number[]) => {
      const params = buildItemImpressionsProperties(indexesToSend);

      if (params !== undefined) {
        eventStreamService.sendEvent(
          {
            name: EventNames.ItemImpressions,
            type: EventNames.ItemImpressions,
            context: eventContext
          },
          parseEventParams({ ...params })
        );
      } else {
        fireEvent('WebHomePageFriendsCarouselItemImpressionsUndefinedError');
      }
    },
    [buildItemImpressionsProperties, eventContext]
  );

  useCollectionItemsIntersectionTracker(
    containerRef,
    friendsList?.length ?? 0,
    sendItemImpressions
  );
};

export default useFriendsCarouselImpressionTracker;
