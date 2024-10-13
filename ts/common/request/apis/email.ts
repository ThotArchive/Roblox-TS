/* eslint-disable import/prefer-default-export */

import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Email from '../types/email';

export const updateForCurrentUser = (
  emailAddress: string
): Promise<Result<void, Email.EmailError | null>> =>
  toResult(
    httpService.post(Email.UPDATE_FOR_CURRENT_USER_CONFIG, {
      emailAddress,
      skipVerificationEmail: true
    }),
    Email.EmailError
  );

export const getEmailConfiguration = (): Promise<
  Result<Email.GetEmailConfigurationReturnType, Email.EmailError | null>
> => toResult(httpService.get(Email.GET_EMAIL_CONFIG), Email.EmailError);
