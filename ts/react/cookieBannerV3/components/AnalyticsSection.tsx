import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { Link } from 'react-style-guide';
import classNames from 'classnames';
import CookieItem from './CookieItem';
import consentToolConstants from '../constants/consentToolConstants';
import urlConstants from '../constants/urlConstants';

const AnalyticsSection = ({
  translate,
  isNonEssentialCookieListVisible
}: {
  translate: TranslateFunction;
  isNonEssentialCookieListVisible: boolean;
}): JSX.Element => {
  const GASectionCssClass = classNames({ hidden: !isNonEssentialCookieListVisible });

  const GACompanyCollectList = consentToolConstants.GACompanyCollectionList.map(data => (
    <div className='google-analytics-company-info-sec'>
      <p className='font-caption-header text-emphasis'>{translate(data.label)}</p>
      <p className='font-caption-body text'>{translate(data.content)}</p>
    </div>
  ));
  const GAReadMoreLink = (
    <a
      className='text-link'
      target='_blank'
      href={urlConstants.googleAnalyticsReadMore}
      rel='noreferrer'>
      {translate(consentToolConstants.googleAnalytics)}
    </a>
  );
  const GAReadMoreContent = translate(consentToolConstants.GAReadMore);
  const readMoreUrlIndex = GAReadMoreContent.indexOf(consentToolConstants.GAReadMoreUrl);
  const GAReadMore = (
    <p className='font-caption-body text'>
      {GAReadMoreContent.substring(0, readMoreUrlIndex)}
      {GAReadMoreLink}
    </p>
  );
  const GASection = (
    <div>
      <Link cssClasses='font-header-2 text-emphasis' url={urlConstants.googleAnalyticsWebsite}>
        {translate(consentToolConstants.googleAnalytics)}
        <span className='icon-nav-external-link-sm cookie-external-link-icon' />
      </Link>
      <div>
        <span className='google-analytics-info-subheader'>
          {translate(consentToolConstants.ownedBy)}
        </span>
        <span className='font-caption-header text-emphasis'>{consentToolConstants.googleInc}</span>
      </div>
      <p className='text-emphasis google-analytics-company-info-sec'>
        {translate(consentToolConstants.googleAnalyticsPurposeHeader)}
      </p>
      <span className='font-caption-body text'>
        {translate(consentToolConstants.googleAnalyticsPurposeDescription)}
      </span>
      <p className='text-emphasis google-analytics-company-info-sec'>
        {translate(consentToolConstants.companyCollectionHeader)}
      </p>
      {GACompanyCollectList}
      {GAReadMore}
    </div>
  );
  const analyticsCookieList = (
    <div className='analytics-cookie-list'>
      <CookieItem
        cookieName={consentToolConstants.RBXViralAcquisition.cookieName}
        description={translate(consentToolConstants.RBXViralAcquisition.description)}
      />
      <CookieItem
        cookieName={consentToolConstants.RBXSource.cookieName}
        description={translate(consentToolConstants.RBXSource.description)}
      />
    </div>
  );

  return (
    <div className={GASectionCssClass}>
      {analyticsCookieList}
      {GASection}
    </div>
  );
};

export default AnalyticsSection;
