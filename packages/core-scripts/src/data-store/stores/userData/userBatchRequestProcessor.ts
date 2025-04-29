import { post } from "../../../http";
import BatchRequestFactory from "../../../util/batch-request/batchRequestFactory";
import {
  getUsersUrl,
  DefaultUserBatchSize,
  DefaultUserProcessBatchWaitTime,
  UserObject,
  UserQueueItem,
} from "./userDataConstants";

const batchRequestFactory = new BatchRequestFactory<UserQueueItem, UserObject>();

const userBatchRequestProcessor = batchRequestFactory.createRequestProcessor(
  items => {
    const urlConfig = {
      url: getUsersUrl(),
      retryable: true,
      withCredentials: true,
    };
    const userIds = items.map(({ data: { userId } }) => userId);
    return post<{ data: UserObject[] }>(urlConfig, { userIds, excludeBannedUsers: true }).then(
      ({ data: { data: users } }) => {
        const results: Record<number, UserObject> = {};
        for (const user of users) {
          results[user.id] = user;
        }
        return results;
      },
    );
  },
  ({ userId }: UserQueueItem) => userId.toString(),
  {
    batchSize: DefaultUserBatchSize,
    processBatchWaitTime: DefaultUserProcessBatchWaitTime,
  },
);

export default userBatchRequestProcessor;
