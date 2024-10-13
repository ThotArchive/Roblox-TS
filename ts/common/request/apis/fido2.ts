import { fido2Util, hybridResponseService } from 'core-roblox-utilities';
import { DeviceMeta } from 'Roblox';
import { FeatureTarget } from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/services/hybridResponseService';
import { Result } from '../../result';
import { toResultCustomRequest } from '../common';
import * as fido2 from '../types/fido2';

const parseFido2ErrorCode = (error: unknown): number | null => {
  const { code } = error as Record<string, unknown>;
  return code as number;
};

export const getNativeResponse = (
  feature: FeatureTarget,
  parameters: Record<string, unknown>,
  timeoutMilliseconds: number
): Promise<Result<fido2.GetNativeResponseReturnType, fido2.Fido2Error | null>> =>
  toResultCustomRequest(
    hybridResponseService.getNativeResponse(feature, parameters, timeoutMilliseconds),
    fido2.Fido2Error,
    parseFido2ErrorCode,
    (credentialString: string | null) => {
      if (credentialString === null) {
        return null;
      }

      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const credential = JSON.parse(credentialString);
      // Custom handling of error.
      if (credential.errorCode !== undefined) {
        const e = {
          name: 'getNativeResponse Error',
          message: credential.errorMsg,
          code: credential.errorCode
        } as Error;
        throw e;
      }

      // Android does not need conversion
      const shouldConvertToStandardBase64 = !(
        DeviceMeta &&
        DeviceMeta().isInApp &&
        DeviceMeta().isAndroidApp
      );
      return shouldConvertToStandardBase64
        ? fido2Util.formatCredentialAuthenticationResponseApp(credentialString)
        : credentialString;
    }
  );

export const getNavigatorCredentials = (
  options?: CredentialRequestOptions
): Promise<Result<fido2.GetNavigatorCredentialsReturnType, fido2.Fido2Error | null>> =>
  toResultCustomRequest(navigator.credentials.get(options), fido2.Fido2Error).then(result =>
    Result.map(result, (credential: Credential | null) => {
      if (credential === null) {
        return null;
      }
      return fido2Util.formatCredentialAuthenticationResponseWeb(credential as PublicKeyCredential);
    })
  );
