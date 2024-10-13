import { allowedLinkTypes, allowedPathnames } from '../constants/affiliateLinksConstants';

const getIsExperienceAffiliate = (url: URL): boolean => {
  return (
    allowedPathnames.includes(url.pathname) &&
    allowedLinkTypes.includes(url.searchParams.get('type') ?? '')
  );
};

export const getLinkCode = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    if (allowedPathnames.includes(parsedUrl.pathname)) {
      return parsedUrl.searchParams.get('code') ?? '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

export const getExperienceAffiliateReferralUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const referral = parsedUrl.searchParams.get('referralUrl');

    if (!referral) {
      return null;
    }

    const referralUrl = new URL(decodeURIComponent(referral));
    if (getIsExperienceAffiliate(referralUrl)) {
      return referralUrl.href;
    }

    return null;
  } catch (e) {
    return null;
  }
};
