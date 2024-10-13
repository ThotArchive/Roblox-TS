import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import { AccountSwitcherService } from 'Roblox';
import { dataStores } from 'core-roblox-utilities';
import authUtil from '../util/authUtil';

const { getSignupUrl, getIsVNGLandingRedirectEnabled } = authUtil;

function HeaderSignupLink({ translate }) {
  // use effect for get signupurl
  // eslint-disable-next-line no-undef
  const [showSignupButton, setShowSignupButton] = useState(false);
  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  const handleSignupClick = () => {
    window.location.href = getSignupUrl(isAccountSwitchingEnabledForBrowser);
  };

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromCurrentUrl }
      } = dataStores;
      saveGameIntentFromCurrentUrl();
    } catch (e) {
      console.error('Failed to save game intent from current url', e);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isVNGComplianceEnabled = await getIsVNGLandingRedirectEnabled();
        setShowSignupButton(!isVNGComplianceEnabled);
      } catch (e) {
        // Handle error from getIntAuthCompliancePolicy() or any other error in fetchData
        setShowSignupButton(true); // fallback to show signup button
      }
    };
    fetchData();
  }, []);

  return (
    showSignupButton && (
      <li className='signup-button-container'>
        <Link
          onClick={handleSignupClick}
          url={getSignupUrl(isAccountSwitchingEnabledForBrowser)}
          id='sign-up-button'
          className='rbx-navbar-signup btn-growth-sm nav-menu-title signup-button'>
          {translate('Label.sSignUp')}
        </Link>
      </li>
    )
  );
}
HeaderSignupLink.propTypes = {
  translate: PropTypes.func.isRequired
};

export default HeaderSignupLink;
