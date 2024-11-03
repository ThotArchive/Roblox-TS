import { EnvironmentUrls } from 'Roblox';
import { AxiosResponse, httpService } from 'core-utilities';
import { ReminderDataType } from './types';

const reminderUrl = `${EnvironmentUrls.userModerationApi}/v1/reminder`;

const fetchReminderData = async (): Promise<AxiosResponse<ReminderDataType | null>> => {
  const urlConfig: { url: string; withCredentials: boolean } = {
    url: reminderUrl,
    withCredentials: true
  };
  return httpService.get(urlConfig);
};

export default fetchReminderData;
