/* eslint-disable import/prefer-default-export */
import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Captcha from '../types/captcha';

export const getMetadata = (): Promise<
  Result<Captcha.GetMetadataReturnType, Captcha.CaptchaError | null>
> => toResult(httpService.get(Captcha.GET_METADATA_CONFIG, {}), Captcha.CaptchaError);
