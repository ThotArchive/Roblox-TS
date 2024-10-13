// all functions that call apis related to signup
import { httpService } from 'core-utilities';
import {
  TSignupParams,
  TSignupResponse,
  TAuthMetadataV2Response,
  TUserAgreementsResponse,
  TValidateUsernameParams,
  TValidateUsernameResponse,
  TValidatePasswordParams,
  TValidatePasswordResponse,
  TPostUsernameSuggestionsParams,
  TPostUsernameSuggestionsResponse
} from '../../common/types/signupTypes';
import { urlConstants } from '../constants/signupConstants';

export const signup = async (params: TSignupParams): Promise<TSignupResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: urlConstants.signup
  };
  const { data } = await httpService.post<TSignupResponse>(urlConfig, params);
  return data;
};

export const getMetadataV2 = async (): Promise<TAuthMetadataV2Response> => {
  const urlConfig = {
    withCredentials: true,
    url: urlConstants.metadataV2
  };
  const { data } = await httpService.get<TAuthMetadataV2Response>(urlConfig);
  return data;
};

export const getUserAgreements = async (): Promise<TUserAgreementsResponse> => {
  const urlConfig = {
    url: urlConstants.userAgreements
  };
  const { data } = await httpService.get<TUserAgreementsResponse>(urlConfig);
  return data;
};

export const validateUsername = async (
  params: TValidateUsernameParams
): Promise<TValidateUsernameResponse> => {
  const urlConfig = {
    url: urlConstants.validateUsername
  };
  const { data } = await httpService.post<TValidateUsernameResponse>(urlConfig, params);
  return data;
};

export const validatePassword = async (
  params: TValidatePasswordParams
): Promise<TValidatePasswordResponse> => {
  const urlConfig = {
    url: urlConstants.validatePassword
  };
  const { data } = await httpService.post<TValidatePasswordResponse>(urlConfig, params);
  return data;
};

export const postUsernameSuggestions = async (
  params: TPostUsernameSuggestionsParams
): Promise<TPostUsernameSuggestionsResponse> => {
  const urlConfig = {
    url: urlConstants.usernameSuggestion
  };
  const { data } = await httpService.post<TPostUsernameSuggestionsResponse>(urlConfig, params);
  return data;
};

export default {
  signup,
  getMetadataV2,
  getUserAgreements,
  validateUsername
};
