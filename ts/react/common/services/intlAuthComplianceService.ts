import { httpService } from 'core-utilities';
import { TIntAuthComplianceResponse } from '../types/intAuthComplianceTypes';
import { intlAuthComplianceUrl } from '../constants/urlConstants';

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const url = intlAuthComplianceUrl;
  const urlConfig = {
    withCredentials: true,
    url
  };
  const { data } = await httpService.get<TIntAuthComplianceResponse>(urlConfig);
  return data;
};

export default {
  getIntAuthCompliancePolicy
};
