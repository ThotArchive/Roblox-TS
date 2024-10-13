// all functions that call apis relating to landing page
import { httpService } from 'core-utilities';
import { TContentRatingLogoPolicyResponse } from '../../common/types/landingTypes';
import { urlConstants } from '../constants/landingConstants';

export const getContentRatingLogoPolicy = async (): Promise<TContentRatingLogoPolicyResponse> => {
  const url = urlConstants.contentRatingLogoPolicy;
  const urlConfig = {
    url
  };
  const { data } = await httpService.get<TContentRatingLogoPolicyResponse>(urlConfig);
  return data;
};

export default {
  getContentRatingLogoPolicy
};
