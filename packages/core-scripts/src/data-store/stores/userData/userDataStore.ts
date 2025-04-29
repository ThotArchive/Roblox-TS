import BatchRequestFactory from "../../../util/batch-request/batchRequestFactory";
import BatchRequestProcessor from "../../../util/batch-request/batchRequestProcessor";
import {
  QueueItem,
  BatchIdSerializer,
  BatchItemProcessor,
  CacheProperties,
} from "../../../util/batch-request/batchRequestConstants";
import { get, post } from "../../../http";
import {
  populateFriendsData,
  populatePresenceData,
  getFriendsUrlConfig,
  getPresenceUrlConfig,
  getFriendsParams,
} from "./userStoreUtil";
import {
  UserDataRequest,
  FriendsRes,
  FriendResult,
  MethodType,
  PresenceObject,
  MaxFriendRequestNotificationCount,
  MaxMessagesNotificationCount,
  FriendsUserSortType,
  UserObject,
} from "./userDataConstants";
import userBatchRequestProcessor from "./userBatchRequestProcessor";

const batchRequestFactory = new BatchRequestFactory<UserDataRequest, FriendResult>();

const processors = new Map<string, BatchRequestProcessor<UserDataRequest, FriendResult>>();

const getIdSerializer = (
  methodName: MethodType,
  { userId, cursor, sortOrder, userSort, limit }: UserDataRequest,
) => `${methodName}:${userId}:${cursor}:${sortOrder}:${userSort}:${limit}`;

const getUserDataRequestProcessor = (
  methodName: string,
  itemProcessor: BatchItemProcessor<UserDataRequest>,
  idSerializer: BatchIdSerializer<UserDataRequest>,
) => {
  if (processors.has(methodName)) return processors.get(methodName);
  const processor = batchRequestFactory.createRequestProcessor(itemProcessor, idSerializer, {
    batchSize: 1,
  });
  processors.set(methodName, processor);
  return processor;
};

const getItemProcessor =
  (methodName: MethodType) =>
  ([first]: QueueItem<UserDataRequest>[]) => {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { key, data: userDataRequest } = first!;
    const { userId, isGuest } = userDataRequest;
    const urlConfig = getFriendsUrlConfig(methodName, userId);
    const params = getFriendsParams(userDataRequest);

    return get<FriendsRes>(urlConfig, params)
      .then(friendsRes => {
        const results: Record<string, FriendResult> = {};
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!friendsRes.data) {
          results[key] = { userData: [] };
          return results;
        }

        const {
          data: { data: userData, previousPageCursor: prevCursor, nextPageCursor: nextCursor },
        } = friendsRes;
        const friendsData = populateFriendsData(userData);

        if (isGuest) {
          results[key] = { userData, prevCursor, nextCursor };
          return results;
        }

        const presenceUrlConfig = getPresenceUrlConfig();

        const userIds = Object.keys(friendsData).map(id => parseInt(id, 10));
        return post<PresenceObject>(presenceUrlConfig, { userIds })
          .then(presenceData => {
            populatePresenceData(friendsData, presenceData.data);
            results[key] = { userData, prevCursor, nextCursor };
            return results;
          })
          .catch((error: unknown) => {
            // do not retry presence call if failed
            // eslint-disable-next-line no-console
            console.debug(error);
            results[key] = { userData, prevCursor, nextCursor };
            return results;
          });
      })
      .catch((error: unknown) => {
        // request will be retried if not successful
        // eslint-disable-next-line no-console
        console.debug(error);
        return {};
      });
  };

const generateUserDataStoreMethod = (methodName: MethodType) => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const userDataProcessor = getUserDataRequestProcessor(
    methodName,
    getItemProcessor(methodName),
    ({ userId }: UserDataRequest) => userId.toString(),
  )!;

  return (userDataRequest: UserDataRequest, cacheProperties?: CacheProperties) => {
    const requestKey = getIdSerializer(methodName, userDataRequest);

    if (cacheProperties?.refreshCache) {
      userDataProcessor.invalidateItem(userDataRequest, requestKey);
    }
    return userDataProcessor.queueItem(userDataRequest, requestKey, cacheProperties);
  };
};

const clearUserDataStoreCache = (): void => {
  for (const processor of processors.values()) {
    processor.clearCache();
  }
};

export default {
  getFriends: generateUserDataStoreMethod(MethodType.Friends),
  getFollowers: generateUserDataStoreMethod(MethodType.Followers),
  getFollowings: generateUserDataStoreMethod(MethodType.Followings),
  getFriendsRequests: generateUserDataStoreMethod(MethodType.Requests),
  getUser: (userId: number): Promise<UserObject> => userBatchRequestProcessor.queueItem({ userId }),
  clearUserDataStoreCache,
  maxFriendRequestNotificationCount: MaxFriendRequestNotificationCount,
  maxMessagesNotificationCount: MaxMessagesNotificationCount,
  FriendsUserSortType,
};
