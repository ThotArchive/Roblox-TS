import { httpService } from 'core-utilities';
import urlConstants from '../constants/urlConstants';

const { getIntlAuthComplianceUrl } = urlConstants;

export type TIntAuthComplianceResponse = {
  isVNGComplianceEnabled?: boolean;
};

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const urlConfig = { url: getIntlAuthComplianceUrl(), withCredentials: true };
  const { data } = await httpService.get<TIntAuthComplianceResponse>(urlConfig);
  return data;
};

export default {
  getIntAuthCompliancePolicy
};
