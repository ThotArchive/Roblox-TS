import React, { Fragment } from 'react';
import { authenticatedUser } from 'header-scripts';
import { IconButton } from 'react-style-guide';
import { withTranslations } from 'react-utilities';
import { translationConfig } from '../translation.config';
import layoutConstant from '../constants/layoutConstants';
import SkipToMainContent from '../components/SkipToMainContent';

const { headerMenuIconClickEvent } = layoutConstant;
const { isAuthenticated } = authenticatedUser;

function MenuIcon(props) {
  const { iconTypes } = IconButton;
  const onClickMenuIcon = () => {
    document.dispatchEvent(new CustomEvent(headerMenuIconClickEvent.name));
  };

  return (
    <Fragment>
      <SkipToMainContent {...props} />
      {isAuthenticated && (
        <IconButton
          className='menu-button'
          iconType={iconTypes.navigation}
          iconName='nav-menu'
          onClick={onClickMenuIcon}
        />
      )}
    </Fragment>
  );
}

MenuIcon.propTypes = {};

export default withTranslations(MenuIcon, translationConfig);
