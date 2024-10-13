import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { bannerTranslationConfig } from '../translation.config';
import cookieBannerServices from '../services/cookieBannerServices';
import cookieUtils from '../utils/cookieUtils';
import cookieConstants from '../constants/cookieConstants';
import bannerConstants from '../constants/bannerConstants';
import consentCookieHandler from '../utils/consentCookieHandler';
import { TCookiePolicy, TEssentialCookie } from '../types/cookiePolicyTypes';
import Banner from './Banner';
import ConsentTool from './ConsentTool';

export const CookieBannerV3Base = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [nonEssentialCookieList, updateNonEssentialCookieList] = useState<string[]>([]);
  const [essentialCookieList, updateEssentialCookieList] = useState<TEssentialCookie[]>([]);
  const [shouldDisplayBannerOrConsentTool, updateBannerVisibility] = useState<string | null>(null);

  const { cookieModule } = bannerConstants;
  useEffect(() => {
    const updateCookiePolicy = async () => {
      const cookiePolicy: TCookiePolicy = await cookieBannerServices.getCookiePolicy();
      if (cookiePolicy.ShouldDisplayCookieBannerV3 && cookiePolicy.EssentialCookieList) {
        updateNonEssentialCookieList(cookiePolicy.NonEssentialCookieList);
        updateEssentialCookieList(cookiePolicy.EssentialCookieList);
        updateBannerVisibility(cookieModule.banner);
      } else {
        // User outside of EEA,
        // default to accept all cookies
        consentCookieHandler.setUserConsent(
          cookiePolicy.NonEssentialCookieList,
          cookiePolicy.NonEssentialCookieList
        );
      }
    };
    const consentCookie = cookieUtils.getCookie(cookieConstants.consentCookieName);
    if (!consentCookie || consentCookie === '') {
      // eslint-disable-next-line no-void
      void updateCookiePolicy();
    }
  }, []);

  switch (shouldDisplayBannerOrConsentTool) {
    case cookieModule.banner:
      return (
        <Banner
          translate={translate}
          nonEssentialCookieList={nonEssentialCookieList}
          closeBanner={() => updateBannerVisibility(null)}
          showConsentTool={() => updateBannerVisibility(cookieModule.consentTool)}
        />
      );
    case cookieModule.consentTool:
      return (
        <ConsentTool
          translate={translate}
          essentialCookieList={essentialCookieList}
          nonEssentialCookieList={nonEssentialCookieList}
          closeConsentTool={updateBannerVisibility}
        />
      );
    default:
      return <div />;
  }
};

export default withTranslations(CookieBannerV3Base, bannerTranslationConfig);
