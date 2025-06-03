import "../global";

const { Hybrid } = window.Roblox;

const LOG_PREFIX = "Hybrid Response Service: ";

export enum FeatureTarget {
  GET_CREDENTIALS = "getCredentials",
  REGISTER_CREDENTIALS = "registerCredentials",
  CREDENTIALS_PROTOCOL_AVAILABLE = "credentialsProtocolAvailable",
  GET_INTEGRITY_TOKEN = "getIntegrityToken",
}

const resolveNullAfter = (timeoutMilliseconds: number) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, timeoutMilliseconds);
  });

const nativePromises: Record<number, Promise<string>> = {};
const nativeResolves: Record<number, (value: string) => void> = {};
let nextCallId = 0;

// This is exclusively called by the Lua layer via BrowserService:ExecuteJavaScript(injectNativeResponse).
export const injectNativeResponse = (callId: number, value: unknown): void => {
  if (nativeResolves[callId] !== undefined) {
    nativeResolves[callId](String(value));
  }
};

export const getNativeResponse = (
  feature: FeatureTarget,
  parameters: Record<string, unknown>,
  timeoutMilliseconds: number,
): Promise<unknown> => {
  nextCallId += 1;
  const currentCallId = nextCallId;
  nativePromises[currentCallId] = new Promise(resolve => {
    nativeResolves[currentCallId] = (value: string) => {
      resolve(value);
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete nativePromises[currentCallId];
      // TODO: old, migrated code. Why is this run twice??
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete nativeResolves[currentCallId];
    };
  });

  if (Hybrid?.Navigation) {
    Hybrid.Navigation.navigateToFeature(
      {
        feature,
        data: {
          callId: currentCallId,
          ...parameters,
        },
      },
      () => {
        // eslint-disable-next-line no-console
        console.log(LOG_PREFIX, "Sent native request:", feature);
      },
    );
  }
  return Promise.race([resolveNullAfter(timeoutMilliseconds), nativePromises[currentCallId]]);
};
