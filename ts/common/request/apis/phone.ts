import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Phone from '../types/phone';

// eslint-disable-next-line import/prefer-default-export
export const getPhoneConfiguration = async (): Promise<
  Result<Phone.GetPhoneConfigurationReturnType, Phone.PhoneError | null>
> => toResult(httpService.get(Phone.GET_PHONE_CONFIG, {}), Phone.PhoneError);
