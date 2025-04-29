import { AxiosPromise } from "axios";
import localStorage from "../../../local-storage";
import * as LocaleProvider from "../../providers/locale/localeProvider";

const localeApiInstance = new LocaleProvider.LocaleApi();

const enum localeStorageCacheKeys {
  getLocales = "Roblox.Api.Locales.getLocales",
}

const getLocales = (): AxiosPromise<LocaleProvider.ApiArrayResponseSupportedLocaleLocus> =>
  localeApiInstance.v1LocalesGet({ withCredentials: true });

const getUserLocale = (): AxiosPromise<LocaleProvider.UserLocalizationLocusLocalesResponse> =>
  localeApiInstance.v1LocalesUserLocalizationLocusSupportedLocalesGet({
    withCredentials: true,
  });

const setUserLocale = (localeCode: string): AxiosPromise<LocaleProvider.SuccessResponse> => {
  const payload: LocaleProvider.SetSupportedLocaleForUserRequest = {
    supportedLocaleCode: localeCode,
  };
  return localeApiInstance.v1LocalesSetUserSupportedLocalePost(payload, { withCredentials: true });
};

const requestDataFromCacheOrNetwork = <T>(
  networkCaller: () => AxiosPromise<T>,
  localeStorageKey: string,
  cacheDurationInMs: number,
): Promise<T> =>
  new Promise((resolve, reject) => {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const localStorageData = localStorage.fetchNonExpiredCachedData(
      localeStorageKey,
      cacheDurationInMs,
    ) as { data: T } | undefined;
    if (!localStorageData) {
      networkCaller().then(
        response => {
          localStorage.saveDataByTimeStamp(localeStorageKey, response.data);
          resolve(response.data);
        },
        (error: unknown) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error);
        },
      );
    } else {
      resolve(localStorageData.data);
    }
  });

const getLocalesWithCache = (
  cacheDurationInMs: number,
): Promise<LocaleProvider.ApiArrayResponseSupportedLocaleLocus> =>
  requestDataFromCacheOrNetwork(getLocales, localeStorageCacheKeys.getLocales, cacheDurationInMs);

export default {
  getLocales,
  getUserLocale,
  setUserLocale,
  getLocalesWithCache,
};
