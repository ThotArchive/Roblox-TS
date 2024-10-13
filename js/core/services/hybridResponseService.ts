import { Hybrid } from 'Roblox';

const LOG_PREFIX = 'Hybrid Response Service: ';

export enum FeatureTarget {
  GET_CREDENTIALS = 'getCredentials',
  REGISTER_CREDENTIALS = 'registerCredentials',
  CREDENTIALS_PROTOCOL_AVAILABLE = 'credentialsProtocolAvailable',
  GET_INTEGRITY_TOKEN = 'getIntegrityToken'
}

const resolveNullAfter = (timeoutMilliseconds: number) =>
  new Promise(resolve => setTimeout(() => resolve(null), timeoutMilliseconds));

const nativePromises = {} as Record<number, Promise<string>>;
const nativeResolves = {} as Record<number, (value: string) => void>;
let nextCallId = 0;

// This is exclusively called by the Lua layer via BrowserService:ExecuteJavaScript(injectNativeResponse).
const injectNativeResponse = (callId: number, value: unknown) => {
  if (nativeResolves[callId] !== undefined) {
    nativeResolves[callId](String(value));
  }
};

const getNativeResponse = (
  feature: FeatureTarget,
  parameters: Record<string, unknown>,
  timeoutMilliseconds: number
) => {
  nextCallId += 1;
  const currentCallId = nextCallId;
  nativePromises[currentCallId] = new Promise(resolve => {
    nativeResolves[currentCallId] = (value: string) => {
      resolve(value);
      delete nativePromises[currentCallId];
      delete nativeResolves[currentCallId];
    };
  });

  if (Hybrid && Hybrid.Navigation) {
    Hybrid.Navigation.navigateToFeature(
      {
        feature,
        data: {
          callId: currentCallId,
          ...parameters
        }
      },
      () => console.log(LOG_PREFIX, 'Sent native request:', feature)
    );
  }
  return Promise.race([resolveNullAfter(timeoutMilliseconds), nativePromises[currentCallId]]);
};

export default {
  FeatureTarget,
  injectNativeResponse,
  getNativeResponse
};
