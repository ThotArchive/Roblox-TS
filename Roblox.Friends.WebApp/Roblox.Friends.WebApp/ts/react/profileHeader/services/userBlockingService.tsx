import { httpService } from 'core-utilities';
import { CurrentUser } from 'Roblox';
import apiConstants from '../constants/apiEndpoint';

const blockUser = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(apiConstants.blockUserV2(profileId));
  return data;
};

const unblockUser = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(apiConstants.unblockUserV2(profileId));
  return data;
};

const isBlockedUser = async (profileId: number): Promise<boolean> => {
  const { data }: { data: boolean } = await httpService.get(apiConstants.isBlockedUser(profileId));
  return data;
};

const batchCheckReciprocalBlock = async (userIds: number[]): Promise<{}> => {
  const requesterUserId = parseInt(CurrentUser.userId, 10);
  if (Number.isNaN(requesterUserId) || !requesterUserId) {
    return {
      users: [
        {
          isBlocked: false,
          isBlockingViewer: false,
          userId: 0
        }
      ]
    };
  }
  const {
    data
  }: {
    data: { users: { isBlocked: boolean; isBlockingViewer: boolean; userId: number }[] };
  } = await httpService.post(apiConstants.batchCheckReciprocalBlock(), {
    userIds,
    requesterUserId
  });
  return data;
};

export default {
  blockUser,
  unblockUser,
  isBlockedUser,
  batchCheckReciprocalBlock
};
