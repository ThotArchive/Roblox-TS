import React from 'react';
import PropTypes from 'prop-types';
import { authenticatedUser } from 'header-scripts';
import { DeviceMeta } from 'Roblox';
import { pageName, urlService } from 'core-utilities';
import CopyrightMessage from './CopyrightMessage';
import FooterLinks from './FooterLinks';
import LanguageSelector from '../containers/LanguageSelector';

function Footer(props) {
  const isLandingPage = pageName.PageNameProvider && pageName.PageNameProvider.isLandingPage();
  const isAuthenticatedUser = authenticatedUser?.isAuthenticated;
  const deviceMeta = DeviceMeta && new DeviceMeta();
  const isPortableDevice = deviceMeta && (deviceMeta.isPhone || deviceMeta.isTablet);
  const showLanguageSelector = isAuthenticatedUser || isLandingPage;

  const handleLanguageChange = supportedLocale => {
    const { locale } = supportedLocale;
    if (isLandingPage && locale) {
      const queryParameters = new URLSearchParams(window.location.search);
      // Fetch dataToken url query param
      const dataToken = queryParameters.get('dataToken');
      const isDataTokenPresent = !!dataToken;
      const urlFormatObject = {
        pathname: window.location.pathname,
        query: isDataTokenPresent ? { locale, dataToken } : { locale }
      };
      window.location.href = urlService.formatUrl(urlFormatObject);
    } else {
      window.location.reload();
    }
  };

  const copyrightClassWithLanguageSelector = 'col-sm-6 col-md-9';
  const copyrightClass = 'col-sm-12';
  const { translate } = props;

  return (
    <div className='footer'>
      <FooterLinks {...props} />
      <div className='row copyright-container'>
        <div className='col-sm-6 col-md-3'>
          {showLanguageSelector && (
            <LanguageSelector
              translate={translate}
              onLanguageChange={handleLanguageChange}
              isAuthenticatedUser={isAuthenticatedUser}
              showWarningMessageForUnsupportedLocale={false}
              isNative={isPortableDevice}
            />
          )}
        </div>
        <div className={showLanguageSelector ? copyrightClassWithLanguageSelector : copyrightClass}>
          <CopyrightMessage {...props} />
        </div>
      </div>
    </div>
  );
}

Footer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default Footer;
