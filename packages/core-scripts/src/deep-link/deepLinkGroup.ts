import { DeepLink } from "./deepLinkConstants";

const deepLinkGroup = (target: DeepLink): Promise<boolean> => {
  const { groupId } = target.params;
  if (groupId) {
    window.location.href = `/groups/${groupId}`;
  }
  return Promise.resolve(!!groupId);
};

export default deepLinkGroup;
