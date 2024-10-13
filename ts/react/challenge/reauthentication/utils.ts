import { DeviceMeta } from 'Roblox';
import { hybridResponseService } from 'core-roblox-utilities';

export const isPublicKeyCredentialSupported = (): boolean => {
  try {
    return PublicKeyCredential !== undefined;
  } catch (e) {
    return false;
  }
};

export const isCredentialsProtocolAvailable = async (): Promise<boolean> => {
  try {
    const isAvailable = await hybridResponseService.getNativeResponse(
      hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
      {},
      2000
    );
    if (isAvailable === 'true') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

export const isPasskeySupported = async (): Promise<boolean> => {
  const isInApp = DeviceMeta && DeviceMeta().isInApp;
  // Check if WebAuthn is supported or if we are allowing passkeys on all platforms.
  let fido2SupportedViaBrowserApi = true;
  if (isInApp || !isPublicKeyCredentialSupported()) {
    fido2SupportedViaBrowserApi = false;
  }

  // If passkeys are the default type, determine if we need to search for a native
  // fallback API using hybrid calls. Only iOS and Android are supported as of now.
  const isInIosOrAndroidApp = DeviceMeta && (DeviceMeta().isIosApp || DeviceMeta().isAndroidApp);
  let fido2SupportedViaHybridApi = false;
  if (isInApp && isInIosOrAndroidApp) {
    fido2SupportedViaHybridApi = await isCredentialsProtocolAvailable();
  }
  return fido2SupportedViaBrowserApi || fido2SupportedViaHybridApi;
};
