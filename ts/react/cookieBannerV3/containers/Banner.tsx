import React from 'react';
import { Intl } from 'Roblox';
import { TranslateFunction } from 'react-utilities';
import { Button } from 'react-style-guide';
import { urlService } from 'core-utilities';
import consentCookieHandler from '../utils/consentCookieHandler';
import cookieConstants from '../constants/cookieConstants';
import urlConstants from '../constants/urlConstants';

export const Banner = ({
  nonEssentialCookieList,
  closeBanner,
  showConsentTool,
  translate
}: {
  nonEssentialCookieList: string[];
  closeBanner: () => void;
  showConsentTool: () => void;
  translate: TranslateFunction;
}): JSX.Element => {
  // build cookie content with localized privacy policy link
  const locale = new Intl().getRobloxLocale();
  const content = translate(cookieConstants.cookieBannerContent);
  const privacyPolicyLinkIndex = content.indexOf(cookieConstants.privacyPolicyLinkPlaceholder);
  const privacyPolicyUrl = urlService.getUrlWithLocale(urlConstants.privacyPolicyUrl, locale);
  const content1 = <span className='text'>{content.substring(0, privacyPolicyLinkIndex)}</span>;
  const privacyPolicyLinkPlaceholderlength = cookieConstants.privacyPolicyLinkPlaceholder.length;
  const content2 = (
    <span className='text'>
      {content.substring(privacyPolicyLinkIndex + privacyPolicyLinkPlaceholderlength)}
    </span>
  );
  const privacyPolicyLink = (
    <a className='text-link' target='_blank' href={privacyPolicyUrl} rel='noreferrer'>
      {translate(cookieConstants.privacyPolicy)}
    </a>
  );
  const btnOnClick = (acceptedCookieList: string[]) => {
    consentCookieHandler.setUserConsent(acceptedCookieList, nonEssentialCookieList);
    closeBanner();
  };
  return (
    <React.Fragment>
      <div className='cookie-banner'>
        <div className='cookie-description-content'>
          {content1}
          {privacyPolicyLink}
          {content2}
        </div>
        <div>
          <div className='cookie-button-container'>
            <Button
              className='see-all-link btn-secondary-md consent-tool-link'
              onClick={showConsentTool}>
              {translate(cookieConstants.cookieConsent)}
            </Button>
            <div className='cookie-btn-float'>
              <Button className='btn-secondary-lg cookie-btn' onClick={() => btnOnClick([''])}>
                {translate(cookieConstants.declineBtnText)}
              </Button>
              <Button
                className='btn-cta-lg cookie-btn'
                onClick={() => btnOnClick(nonEssentialCookieList)}>
                {translate(cookieConstants.acceptBtnText)}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className='cookie-banner-bg' onClick={() => btnOnClick([''])} aria-hidden='true' />
    </React.Fragment>
  );
};

export default Banner;
