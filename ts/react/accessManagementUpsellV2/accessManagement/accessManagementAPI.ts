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
  extraParameters: ExtraParameter[] = null,
  successfulAction: string = null
) => {
  const encodedExtraParameters = extraParameters ? btoa(JSON.stringify(extraParameters)) : null;
  const urlConfig = getAmpUpsellWithParametersUrlConfig(
    featureName,
    encodedExtraParameters,
    successfulAction
  );

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
