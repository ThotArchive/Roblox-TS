import { httpService } from 'core-utilities';
import { optUserInToVoiceChatConfig } from '../constants/urlConstants';

export const optUserInToVoiceChat = async (isUserOptIn, isOptedInThroughUpsell) => {
  const urlConfig = optUserInToVoiceChatConfig();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  const { data } = await httpService.post(urlConfig, params);
  return data;
};

export default optUserInToVoiceChat;
