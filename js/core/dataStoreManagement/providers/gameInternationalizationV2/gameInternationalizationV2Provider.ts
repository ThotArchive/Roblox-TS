// tslint:disable
/**
 * GameInternationalization Api v2
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v2
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as globalImportUrl from 'url';
import { AxiosPromise, AxiosInstance } from 'axios';
import { httpClient as globalAxios } from '../../../http/http';
import { Configuration } from './configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 *
 * @export
 * @interface RobloxGameInternationalizationApiLanguage
 */
export interface RobloxGameInternationalizationApiLanguage {
  /**
   *
   * @type {string}
   * @memberof RobloxGameInternationalizationApiLanguage
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxGameInternationalizationApiLanguage
   */
  nativeName?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxGameInternationalizationApiLanguage
   */
  languageCode?: string;
}
/**
 *
 * @export
 * @interface RobloxGameInternationalizationApiLanguageWithLocales
 */
export interface RobloxGameInternationalizationApiLanguageWithLocales {
  /**
   *
   * @type {RobloxGameInternationalizationApiLanguage}
   * @memberof RobloxGameInternationalizationApiLanguageWithLocales
   */
  languageFamily?: RobloxGameInternationalizationApiLanguage;
  /**
   *
   * @type {Array<RobloxLocalizationClientSupportedLocale>}
   * @memberof RobloxGameInternationalizationApiLanguageWithLocales
   */
  childLocales?: Array<RobloxLocalizationClientSupportedLocale>;
}
/**
 *
 * @export
 * @interface RobloxLocalizationClientLanguageFamily
 */
export interface RobloxLocalizationClientLanguageFamily {
  /**
   *
   * @type {number}
   * @memberof RobloxLocalizationClientLanguageFamily
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientLanguageFamily
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientLanguageFamily
   */
  nativeName?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientLanguageFamily
   */
  languageCode?: string;
}
/**
 *
 * @export
 * @interface RobloxLocalizationClientSupportedLocale
 */
export interface RobloxLocalizationClientSupportedLocale {
  /**
   *
   * @type {number}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  locale?: RobloxLocalizationClientSupportedLocaleLocaleEnum;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  localeCode?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  nativeName?: string;
  /**
   *
   * @type {RobloxLocalizationClientLanguageFamily}
   * @memberof RobloxLocalizationClientSupportedLocale
   */
  language?: RobloxLocalizationClientLanguageFamily;
}

/**
 * @export
 * @enum {string}
 */
export enum RobloxLocalizationClientSupportedLocaleLocaleEnum {
  EnUs = 'en_us',
  EsEs = 'es_es',
  FrFr = 'fr_fr',
  IdId = 'id_id',
  ItIt = 'it_it',
  JaJp = 'ja_jp',
  KoKr = 'ko_kr',
  RuRu = 'ru_ru',
  ThTh = 'th_th',
  TrTr = 'tr_tr',
  ViVn = 'vi_vn',
  PtBr = 'pt_br',
  DeDe = 'de_de',
  ZhCn = 'zh_cn',
  ZhTw = 'zh_tw',
  BgBg = 'bg_bg',
  BnBd = 'bn_bd',
  CsCz = 'cs_cz',
  DaDk = 'da_dk',
  ElGr = 'el_gr',
  EtEe = 'et_ee',
  FiFi = 'fi_fi',
  HiIn = 'hi_in',
  HrHr = 'hr_hr',
  HuHu = 'hu_hu',
  KaGe = 'ka_ge',
  KkKz = 'kk_kz',
  KmKh = 'km_kh',
  LtLt = 'lt_lt',
  LvLv = 'lv_lv',
  MsMy = 'ms_my',
  MyMm = 'my_mm',
  NbNo = 'nb_no',
  NlNl = 'nl_nl',
  FilPh = 'fil_ph',
  PlPl = 'pl_pl',
  RoRo = 'ro_ro',
  UkUa = 'uk_ua',
  SiLk = 'si_lk',
  SkSk = 'sk_sk',
  SlSl = 'sl_sl',
  SqAl = 'sq_al',
  BsBa = 'bs_ba',
  SrRs = 'sr_rs',
  SvSe = 'sv_se',
  ZhCjv = 'zh_cjv'
}

/**
 *
 * @export
 * @interface RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales
 */
export interface RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales {
  /**
   *
   * @type {Array<RobloxGameInternationalizationApiLanguageWithLocales>}
   * @memberof RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales
   */
  data?: Array<RobloxGameInternationalizationApiLanguageWithLocales>;
}

/**
 * SupportedLanguagesApi - axios parameter creator
 * @export
 */
export const SupportedLanguagesV2ApiAxiosParamCreator = function(configuration?: Configuration) {
  return {
    /**
     *
     * @summary Get the supported languages for a game.
     * @param {number} gameId The id of the game.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    v2SupportedLanguagesGamesGameIdGet: async (
      gameId: number,
      options: any = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'gameId' is not null or undefined
      if (gameId === null || gameId === undefined) {
        throw new RequiredError(
          'gameId',
          'Required parameter gameId was null or undefined when calling v2SupportedLanguagesGamesGameIdGet.'
        );
      }
      const localVarPath = `/v2/supported-languages/games/{gameId}`.replace(
        `{${'gameId'}}`,
        encodeURIComponent(String(gameId))
      );
      const localVarUrlObj = globalImportUrl.parse(localVarPath, true);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      localVarUrlObj.query = {
        ...localVarUrlObj.query,
        ...localVarQueryParameter,
        ...options.query
      };
      // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
      delete localVarUrlObj.search;
      const headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers
      };

      return {
        url: globalImportUrl.format(localVarUrlObj),
        options: localVarRequestOptions
      };
    }
  };
};

/**
 * SupportedLanguagesApi - functional programming interface
 * @export
 */
export const SupportedLanguagesV2ApiFp = function(configuration?: Configuration) {
  return {
    /**
     *
     * @summary Get the supported languages for a game.
     * @param {number} gameId The id of the game.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async v2SupportedLanguagesGamesGameIdGet(
      gameId: number,
      options?: any
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string
      ) => AxiosPromise<
        RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales
      >
    > {
      const localVarAxiosArgs = await SupportedLanguagesV2ApiAxiosParamCreator(
        configuration
      ).v2SupportedLanguagesGamesGameIdGet(gameId, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url
        };
        return axios.request(axiosRequestArgs);
      };
    }
  };
};

/**
 * SupportedLanguagesApi - factory interface
 * @export
 */
export const SupportedLanguagesV2ApiFactory = function(
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance
) {
  return {
    /**
     *
     * @summary Get the supported languages for a game.
     * @param {number} gameId The id of the game.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    v2SupportedLanguagesGamesGameIdGet(
      gameId: number,
      options?: any
    ): AxiosPromise<
      RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales
    > {
      return SupportedLanguagesV2ApiFp(configuration)
        .v2SupportedLanguagesGamesGameIdGet(gameId, options)
        .then(request => request(axios, basePath));
    }
  };
};

/**
 * SupportedLanguagesApi - interface
 * @export
 * @interface SupportedLanguagesV2Api
 */
export interface SupportedLanguagesV2ApiInterface {
  /**
   *
   * @summary Get the supported languages for a game.
   * @param {number} gameId The id of the game.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SupportedLanguagesV2ApiInterface
   */
  v2SupportedLanguagesGamesGameIdGet(
    gameId: number,
    options?: any
  ): AxiosPromise<
    RobloxWebWebAPIModelsApiArrayResponseRobloxGameInternationalizationApiLanguageWithLocales
  >;
}

/**
 * SupportedLanguagesApi - object-oriented interface
 * @export
 * @class SupportedLanguagesApi
 * @extends {BaseAPI}
 */
export class SupportedLanguagesV2Api extends BaseAPI implements SupportedLanguagesV2ApiInterface {
  /**
   *
   * @summary Get the supported languages for a game.
   * @param {number} gameId The id of the game.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SupportedLanguagesV2Api
   */
  public v2SupportedLanguagesGamesGameIdGet(gameId: number, options?: any) {
    return SupportedLanguagesV2ApiFp(this.configuration)
      .v2SupportedLanguagesGamesGameIdGet(gameId, options)
      .then(request => request(this.axios, this.basePath));
  }
}
