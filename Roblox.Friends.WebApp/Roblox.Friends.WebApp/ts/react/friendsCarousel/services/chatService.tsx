import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import { TChatMetadataResponse, TGetChatSettings } from '../types/friendsCarouselTypes';

const { chatApi } = EnvironmentUrls;

const getChatSettings = async (): Promise<TGetChatSettings> => {
  const { data } = await httpService.get<TChatMetadataResponse>({
    url: `${chatApi}/v1/metadata`,
    withCredentials: true
  });
  return {
    chatEnabled: data?.isChatUserMessagesEnabled
  };
};

export default {
  getChatSettings
};
