import React from 'react';
import PropTypes from 'prop-types';
import { authenticatedUser } from 'header-scripts';
import HeaderIconsGroup from '../containers/HeaderIconsGroup';
import UniverseSearchIcon from './UniverseSearchIcon';
import HeaderSignupLink from './HeaderSignupLink';
import HeaderLoginLink from './HeaderLoginLink';

function HeaderRightNav({ translate, toggleUniverseSearch, ...props }) {
  const { isAuthenticated } = authenticatedUser;
  if (isAuthenticated) {
    return (
      <div className='navbar-right rbx-navbar-right'>
        <HeaderIconsGroup
          translate={translate}
          toggleUniverseSearch={toggleUniverseSearch}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className='navbar-right rbx-navbar-right'>
      <ul className='nav navbar-right rbx-navbar-right-nav'>
        <HeaderSignupLink translate={translate} />
        <HeaderLoginLink translate={translate} />
        <UniverseSearchIcon translate={translate} toggleUniverseSearch={toggleUniverseSearch} />
      </ul>
    </div>
  );
}

HeaderRightNav.propTypes = {
  translate: PropTypes.func.isRequired,
  toggleUniverseSearch: PropTypes.func.isRequired
};

export default HeaderRightNav;
