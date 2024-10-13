import { httpService } from 'core-utilities';
import {
  getAmpUpsellUrlConfig,
  getAmpUpsellWithParametersUrlConfig
} from './constants/urlConstants';
import AmpResponse from './AmpResponse';
import { ExtraParameter } from '../types/AmpTypes';

// function to fetch AMP response
export const fetchFeatureCheckResponse = (
  featureName: string,
  extraParameters: ExtraParameter[] = null
) => {
  const encodedString = btoa(JSON.stringify(extraParameters));
  const urlConfig = extraParameters
    ? getAmpUpsellWithParametersUrlConfig(featureName, encodedString)
    : getAmpUpsellUrlConfig(featureName);

  return new Promise(resolve => {
    httpService.get(urlConfig).then(
      ({ data }) => {
        resolve(data as AmpResponse);
      },
      e => {
        throw e;
      }
    );
  });
};

export default fetchFeatureCheckResponse;
