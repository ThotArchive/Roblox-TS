import { httpService } from 'core-utilities';
import {
  getPhoneDiscoverabilityPageMetadataConfig,
  setPhoneDiscoverabilityConsentConfig
} from '../../common/constants/urlConstants';

export const getPhoneDiscoverabilityPageMetadata = () => {
  const urlConfig = getPhoneDiscoverabilityPageMetadataConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      return data;
    },
    e => {
      return null;
    }
  );
};

export const setPhoneDiscoverabilityConsent = phoneNumberDiscoverability => {
  const urlConfig = setPhoneDiscoverabilityConsentConfig();
  const formData = {
    phoneNumberDiscoverability
  };
  return httpService
    .post(urlConfig, formData)
    .then(data => {
      return true;
    })
    .catch(() => {
      return false;
    });
};
