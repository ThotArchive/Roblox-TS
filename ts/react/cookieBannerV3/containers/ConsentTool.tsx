import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { TranslateFunction } from 'react-utilities';
import { Intl } from 'Roblox';
import { createModal, Toggle } from 'react-style-guide';
import { urlService } from 'core-utilities';
import consentToolConstants from '../constants/consentToolConstants';
import urlConstants from '../constants/urlConstants';
import CookieItem from '../components/CookieItem';
import AnalyticsSection from '../components/AnalyticsSection';
import { TEssentialCookie } from '../types/cookiePolicyTypes';
import cookieConstants from '../constants/cookieConstants';
import consentCookieHandler from '../utils/consentCookieHandler';
import bannerConstants from '../constants/bannerConstants';

const { cookieModule } = bannerConstants;
const [Modal, modalService] = createModal();
export const ConsentTool = ({
  nonEssentialCookieList,
  essentialCookieList,
  translate,
  closeConsentTool
}: {
  nonEssentialCookieList: string[];
  essentialCookieList: TEssentialCookie[];
  translate: TranslateFunction;
  closeConsentTool: React.Dispatch<React.SetStateAction<string | null>>;
}): JSX.Element => {
  const [acceptAnalyticsCookie, updateConsent] = useState<boolean>(false);
  const [isEssentialCookieListVisible, updateEssentialCookieListVisibility] = useState<boolean>(
    false
  );
  const [
    isNonEssentialCookieListVisible,
    updateNonEssentialCookieListVisibility
  ] = useState<boolean>(false);

  useEffect(() => {
    modalService.open();
  }, []);

  const essentialCookieSectionCssClass = classNames({ hidden: !isEssentialCookieListVisible });
  const GASectionCollapsible = classNames('cookie-consent-tool-collaps', {
    on: isNonEssentialCookieListVisible
  });
  const essentialCookieSectionCollapsibleIcon = classNames(
    'cookie-consent-tool-collaps font-header-2 text-emphasis ',
    {
      on: isEssentialCookieListVisible
    }
  );

  const locale = new Intl().getRobloxLocale();
  const privacyPolicyUrl = urlService.getUrlWithLocale(urlConstants.privacyPolicyUrl, locale);

  const privacyPolicyLink = (
    <div className='cookie-consent-tool-info-link'>
      <a className='text-link' target='_blank' href={privacyPolicyUrl} rel='noreferrer'>
        {translate(cookieConstants.privacyPolicy)}
        <span className='icon-nav-external-link-sm cookie-external-link-icon' />
      </a>
    </div>
  );
  const requestDataLink = (
    <div className='cookie-consent-tool-info-link'>
      <a className='text-link' target='_blank' href={urlConstants.supportUrl} rel='noreferrer'>
        {translate(consentToolConstants.requestData)}
        <span className='icon-nav-external-link-sm cookie-external-link-icon' />
      </a>
    </div>
  );

  const staticInfoSection = (
    <div>
      <div className='static-section'>
        <div className='font-header-2 text-emphasis google-analytics-company-info-sec'>
          {translate(consentToolConstants.infoCollectionHeader)}
        </div>
        <p className='font-caption-body text'>
          {translate(consentToolConstants.infoCollectionContent)}
        </p>
      </div>
      <div className='static-section'>
        <div className='font-header-2 text-emphasis google-analytics-company-info-sec'>
          {translate(consentToolConstants.infoCollectionHeader2)}
        </div>
        <p className='font-caption-body text'>
          {translate(consentToolConstants.infoCollectionContent2)}
        </p>
      </div>
      <div className='static-section'>
        <div className='font-header-2 text-emphasis google-analytics-company-info-sec'>
          {translate(consentToolConstants.infoPartnerCollectionHeader)}
        </div>
        <p className='font-caption-body text'>
          {translate(consentToolConstants.infoPartnerCollectionContent)}
        </p>
      </div>
    </div>
  );
  const GAToggle = (
    <div>
      <button
        className={GASectionCollapsible}
        type='button'
        onClick={() => updateNonEssentialCookieListVisibility(!isNonEssentialCookieListVisible)}>
        <span className='font-header-2 text-emphasis'>{translate('Heading.AnalyticsCookies')}</span>
      </button>
      <Toggle
        className='cookie-toggle'
        isOn={acceptAnalyticsCookie}
        onToggle={() => updateConsent(!acceptAnalyticsCookie)}
      />
    </div>
  );
  const essentialCookieElementList = essentialCookieList.map(cookie => (
    <CookieItem cookieName={cookie.cookieName} description={translate(cookie.description)} />
  ));

  const customerServicelinks = (
    <div>
      {requestDataLink}
      {privacyPolicyLink}
    </div>
  );
  const essentialCookieSection = (
    <div className='essential-cookie-section'>
      <button
        className={essentialCookieSectionCollapsibleIcon}
        type='button'
        onClick={() => updateEssentialCookieListVisibility(!isEssentialCookieListVisible)}>
        {translate(consentToolConstants.essentialCookie)}
      </button>
      <div className={essentialCookieSectionCssClass}>{essentialCookieElementList}</div>
    </div>
  );

  const body = (
    <div className='cookie-consent-tool-body'>
      {staticInfoSection}
      {customerServicelinks}
      {essentialCookieSection}
      {GAToggle}
      <AnalyticsSection
        isNonEssentialCookieListVisible={isNonEssentialCookieListVisible}
        translate={translate}
      />
    </div>
  );

  const saveConsent = () => {
    const acceptedCookieList = acceptAnalyticsCookie ? nonEssentialCookieList : [];
    consentCookieHandler.setUserConsent(acceptedCookieList, nonEssentialCookieList);
    closeConsentTool(null);
  };

  return (
    <Modal
      title={translate(consentToolConstants.consentToolModalTitle)}
      body={body}
      actionButtonShow
      actionButtonText={translate(consentToolConstants.saveBtn)}
      neutralButtonText={translate(consentToolConstants.cancelBtn)}
      onAction={saveConsent}
      onNeutral={() => closeConsentTool(cookieModule.banner)}
      id='cookie-consent-tool-modal'
    />
  );
};

export default ConsentTool;
