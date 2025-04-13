import userBlockingService from '../../../../ts/react/profileHeader/services/userBlockingService';
import fetchFeatureCheckResponse from '../services/accessManagementService';

const mustHideConnectionsDueToAMP = async vieweeUserId => {
  try {
    const response = await fetchFeatureCheckResponse('MustHideConnections', [
      {
        name: 'vieweeUserId',
        type: 'UserId',
        value: `${vieweeUserId}`
      }
    ]);
    return response?.access === 'Granted';
  } catch (error) {
    console.debug(error);
  }
  return true;
};

const isBlockingViewer = async profileUserId => {
  try {
    const reciprocalBlockResponse = await userBlockingService.batchCheckReciprocalBlock([
      parseInt(profileUserId, 10)
    ]);
    if (reciprocalBlockResponse?.users && reciprocalBlockResponse.users.length > 0) {
      return reciprocalBlockResponse.users[0].isBlockingViewer;
    }
  } catch (e) {
    console.debug(e);
  }
  return true;
};

export { mustHideConnectionsDueToAMP, isBlockingViewer };
