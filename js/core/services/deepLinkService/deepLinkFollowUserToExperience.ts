import { DeepLink } from './deepLinkConstants';

const deepLinkFollowUserToExperience = (target: DeepLink): Promise<boolean> => {
  const { userId } = target.params;
  if (userId) {
    window.location.href = `/games/start?userId=${userId}`;
  }
  return Promise.resolve(!!userId);
};

export default deepLinkFollowUserToExperience;
