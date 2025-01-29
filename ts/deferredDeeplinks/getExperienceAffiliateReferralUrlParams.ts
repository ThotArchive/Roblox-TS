const allowedPathnames = ['/share-links'];
const allowedLinkTypes = ['ExperienceAffiliate'];

const getIsExperienceAffiliate = (url: URL): boolean => {
  return (
    allowedPathnames.includes(url.pathname) &&
    allowedLinkTypes.includes(url.searchParams.get('type') ?? '')
  );
};

const getExperienceAffiliateReferralUrl = (url: string): string | null => {
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

export default getExperienceAffiliateReferralUrl;
