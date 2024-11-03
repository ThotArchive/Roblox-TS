import UserProfileDetails from '../types/UserProfileDetails';
import UserProfileDetailsByUserId from '../types/UserProfileDetailsByUserId';

const formatUserProfileDetailsByUserId = (userProfileDetails: UserProfileDetails[]): UserProfileDetailsByUserId => {
  if (!userProfileDetails || userProfileDetails.length === 0) {
    return {};
  }

  const userProfileDetailsByUserId: UserProfileDetailsByUserId = {};
  userProfileDetails.forEach(({ userId, names, isVerified, isDeleted }) => {
    userProfileDetailsByUserId[userId] = {
      names,
      ...(isVerified != null && { isVerified }),
      ...(isDeleted != null && { isDeleted })
    };
  });
  return userProfileDetailsByUserId;
};

export default formatUserProfileDetailsByUserId;
