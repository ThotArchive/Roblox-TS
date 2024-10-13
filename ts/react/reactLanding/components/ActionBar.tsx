import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { urlService } from 'core-utilities';
import { AccountSwitcherService } from 'Roblox';
import { signupTranslationConfig } from '../translation.config';
import { urlConstants, landingPageStrings } from '../constants/landingConstants';
import { RETURNURL } from '../../common/constants/browserConstants';

const { getQueryParam, composeQueryString } = urlService;

const ActionBar = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [loginUrl, setLoginUrl] = useState(urlConstants.loginLink);

  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  useEffect(() => {
    if (isAccountSwitchingEnabledForBrowser) {
      const returnUrl = getQueryParam(RETURNURL) || '';
      if (returnUrl) {
        setLoginUrl(`${urlConstants.loginLink}?${composeQueryString({ returnUrl })}`);
      } // else leave as login link
    }
  }, [isAccountSwitchingEnabledForBrowser]);

  return (
    <div id='action-bar-container'>
      <div id='action-bar'>
        <a id='main-login-button' className='btn-cta-md' href={loginUrl}>
          {translate(landingPageStrings.logIn)}
        </a>
      </div>
    </div>
  );
};

export default withTranslations(ActionBar, signupTranslationConfig);
