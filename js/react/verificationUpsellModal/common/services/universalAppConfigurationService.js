import { httpService } from 'core-utilities';
import { getSettingsUiPolicyConfig } from '../constants/urlConstants';

export default function getSettingsUIPolicy() {
  const urlConfig = getSettingsUiPolicyConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      return data;
    },
    e => {
      return {};
    }
  );
}
