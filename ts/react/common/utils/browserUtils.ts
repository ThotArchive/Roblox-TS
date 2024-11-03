import { entityUrl } from 'core-roblox-utilities';
import { urlService, seoName } from 'core-utilities';
import { url, chartsUrl } from '../constants/browserConstants';
import { TSortDetailReferral, TGameDetailReferral } from '../constants/eventStreamConstants';
import { PageContext } from '../types/pageContext';

export const buildGameDetailUrl = (
  placeId: number,
  placeName: string,
  eventProperties: TGameDetailReferral = {}
): string => {
  return urlService.getUrlWithQueries(
    `${entityUrl.game.getRelativePath(placeId)}/${seoName.formatSeoName(placeName)}`,
    eventProperties
  );
};

export const buildAddGamePassUrl = (placeId: string): string => {
  const parsedParams = {
    selectedPlaceId: placeId,
    Page: 'game-passes'
  };
  const addGamePassUrl = urlService.getUrlWithQueries('/develop', parsedParams);
  return addGamePassUrl;
};

export const buildGamePassDetailUrl = (passId: string, passName: string): string => {
  return urlService.getAbsoluteUrl(`/game-pass/${passId}/${seoName.formatSeoName(passName)}`);
};

export const buildReportAbuseUrl = (placeId: string, placeName: string): string => {
  const parsedParams = {
    id: placeId,
    RedirectUrl: encodeURIComponent(
      `${entityUrl.game.getRelativePath((placeId as unknown) as number)}/${seoName.formatSeoName(
        placeName
      )}`
    )
  };
  const reportAbuseUrl = urlService.getUrlWithQueries('/abusereport/asset', parsedParams);
  return reportAbuseUrl;
};

const getSortDetailBaseUrl = (
  sortName: string,
  pageContext: PageContext.HomePage | PageContext.GamesPage,
  isChartsPageRenameEnabled: boolean
): string => {
  const encodedSortName = encodeURIComponent(sortName);

  switch (pageContext) {
    case PageContext.HomePage:
      return url.sortDetailV2(encodedSortName);
    case PageContext.GamesPage: {
      if (isChartsPageRenameEnabled) {
        return chartsUrl.sortDetail(encodedSortName);
      }
      return url.sortDetail(encodedSortName);
    }
    default:
      return url.sortDetailV2(encodedSortName);
  }
};

export const buildSortDetailUrl = (
  sortName: string,
  pageContext: PageContext.HomePage | PageContext.GamesPage,
  eventProperties: TSortDetailReferral = {},
  isChartsPageRenameEnabled = false,
  additionalUrlParams: Record<string, string> = {}
): string => {
  const baseUrl = getSortDetailBaseUrl(sortName, pageContext, isChartsPageRenameEnabled);

  return urlService.getUrlWithQueries(baseUrl, { ...eventProperties, ...additionalUrlParams });
};

export const buildEventDetailsUrl = (eventId: string): string => {
  return urlService.getAbsoluteUrl(`/events/${eventId}`);
};

export const getElementWidth = <T extends HTMLElement>(element: T): number => {
  const { marginLeft, marginRight } = window.getComputedStyle(element);
  const { width: domRectWidth } = element.getBoundingClientRect();
  return domRectWidth + (parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0);
};

export const isElementInWindow = <T extends HTMLElement>(element: T): boolean => {
  const { top: domRectTop, height: domRectHeight } = element.getBoundingClientRect();
  return domRectTop + domRectHeight / 2 > 0 && window.innerHeight > domRectTop + domRectHeight / 2;
};

export const getHttpReferrer = (): string => document.referrer;

export default {
  buildAddGamePassUrl,
  buildReportAbuseUrl,
  buildSortDetailUrl,
  buildGameDetailUrl,
  isElementInWindow,
  buildEventDetailsUrl,
  getElementWidth,
  getHttpReferrer
};
