import { httpService } from 'core-utilities';
import { parentEmailUrl } from '../constants/urlConstants';

type TParentEmailResponse = {
  parentEmails: string[];
};
const userSettingsService = {
  getLinkedParentEmails: async (): Promise<TParentEmailResponse> => {
    const urlConfig = { url: parentEmailUrl, withCredentials: true };
    const response = await httpService.get<TParentEmailResponse>(urlConfig);
    return response.data;
  }
};

export default userSettingsService;
