import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import authUtil from '../util/authUtil';

const { isLoginLinkAvailable, getLoginLinkUrl } = authUtil;
const handleLoginClick = () => {
  window.location.href = getLoginLinkUrl();
};

function HeaderLoginLink({ translate }) {
  return (
    <li className='login-action'>
      {isLoginLinkAvailable() && (
        <Link
          onClick={handleLoginClick}
          url={getLoginLinkUrl()}
          className='rbx-navbar-login btn-secondary-sm nav-menu-title rbx-menu-item'>
          {translate('Label.sLogin')}
        </Link>
      )}
    </li>
  );
}
HeaderLoginLink.propTypes = {
  translate: PropTypes.func.isRequired
};

export default HeaderLoginLink;
