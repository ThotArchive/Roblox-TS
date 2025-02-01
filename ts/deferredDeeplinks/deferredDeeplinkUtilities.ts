import { ExperimentationService } from 'Roblox';
import { jsClientDeviceIdentifier } from '@rbx/header-scripts';
import {
  deferredDeeplinkMacLayerName,
  deferredDeeplinkWindowsLayerName,
  isDeferredDeeplinkEnabledFlagName,
  supportedDeferredDeeplinkPathPatterns,
  deferredDeeplinkTokenQueryParameterKey
} from './deferredDeeplinkConstants';
import getExperienceAffiliateReferralUrl from './getExperienceAffiliateReferralUrlParams';
import createDeeplinkToken from './deferredDeeplinkTokenService';

function getDeferredDeeplinkUrl(url: string): string | null {
  const affiliateReferralUrl = getExperienceAffiliateReferralUrl(url);
  if (affiliateReferralUrl) {
    return affiliateReferralUrl;
  }

  const sanitizedUrl = new URL(url);
  sanitizedUrl.search = '';
  sanitizedUrl.hash = '';

  const isSupportedDeferredDeeplinkSource = supportedDeferredDeeplinkPathPatterns.some(pattern =>
    pattern.test(sanitizedUrl.pathname)
  );

  if (isSupportedDeferredDeeplinkSource) {
    return sanitizedUrl.toString();
  }
  return null;
}

async function getDeferredDeeplinkQueryParams(url: string): Promise<string> {
  let queryParams = '';

  const deeplinkUrl = getDeferredDeeplinkUrl(url);
  if (!deeplinkUrl) {
    return queryParams;
  }

  const token = await createDeeplinkToken(deeplinkUrl);
  if (token) {
    queryParams = `?${deferredDeeplinkTokenQueryParameterKey}=${token}`;
  }

  return queryParams;
}

export { getDeferredDeeplinkUrl, getDeferredDeeplinkQueryParams };
