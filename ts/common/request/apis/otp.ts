import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Otp from '../types/otp';

export const sendCodeForUser = (
  otpContactType: Otp.ContactTypes
): Promise<Result<Otp.SendCodeReturnType, Otp.OtpError | null>> =>
  toResult(
    httpService.post(Otp.SEND_CODE_CONFIG, {
      contactType: otpContactType,
      origin: Otp.Origin.Reauth,
      messageVariant: Otp.MessageVariant.Default
    }),
    Otp.OtpError
  );

export const resendCode = (
  otpContactType: Otp.ContactTypes,
  otpSessionToken: string
): Promise<Result<Otp.ResendCodeReturnType, Otp.OtpError | null>> =>
  toResult(
    httpService.post(Otp.RESEND_CODE_CONFIG, {
      contactType: otpContactType,
      origin: Otp.Origin.Reauth,
      otpSessionToken
    }),
    Otp.OtpError
  );

export const validateCode = (
  otpContactType: Otp.ContactTypes,
  otpSessionToken: string,
  passCode: string
): Promise<Result<Otp.ValidateCodeReturnType, Otp.OtpError | null>> =>
  toResult(
    httpService.post(Otp.VALIDATE_CODE_CONFIG, {
      contactType: otpContactType,
      origin: Otp.Origin.Reauth,
      passCode,
      otpSessionToken
    }),
    Otp.OtpError
  );

export const getMetadata = (
  origin: Otp.Origin
): Promise<Result<Otp.MetadataReturnType, Otp.OtpError | null>> =>
  toResult(
    httpService.get(Otp.GET_METADATA_CONFIG, {
      // The parameter name seems to be capitalized for this specific endpoint.
      Origin: origin
    }),
    Otp.OtpError
  );
