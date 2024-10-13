import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import Roblox from 'Roblox';
import LeftNavigation from './containers/LeftNavigation';
import NavigationRightHeader from './containers/NavigationRightHeader';
import NavigationRobux from './containers/NavigationRobux';
import authUtil from './util/authUtil';
import developUtil from './util/developUtil';
import MenuIcon from './containers/MenuIcon';

import '../../../css/navigation/navigation.scss';
import '../../../html/navigation.html';

const { logoutAndRedirect, getIsVNGLandingRedirectEnabled, navigateToLoginWithRedirect } = authUtil;
const rightNavigationHeaderContainerId = 'right-navigation-header';
const leftNavigationContainerId = 'left-navigation-container';
const menuIconContainerId = 'header-menu-icon';
const navigationRobuxContainerId = 'navigation-robux-container';
const navigationRobuxMobileContainerId = 'navigation-robux-mobile-container';

// expose navigation service to external apps
// if adding new values, be careful previous ones aren't overridden
Roblox.NavigationService = {
  ...Roblox.NavigationService,
  logoutAndRedirect,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect
};
developUtil.initializeDevelopLink();

// The anchor html elements lives in navigation.html
// Mounting components seperatly to avoid hydrating
// components that do not need to be server rendered.
ready(() => {
  if (document.getElementById(menuIconContainerId)) {
    render(<MenuIcon />, document.getElementById(menuIconContainerId));
  }

  if (document.getElementById(navigationRobuxContainerId)) {
    render(<NavigationRobux />, document.getElementById(navigationRobuxContainerId));
  }

  if (document.getElementById(navigationRobuxMobileContainerId)) {
    render(<NavigationRobux />, document.getElementById(navigationRobuxMobileContainerId));
  }

  if (document.getElementById(rightNavigationHeaderContainerId)) {
    render(<NavigationRightHeader />, document.getElementById(rightNavigationHeaderContainerId));
  }

  if (document.getElementById(leftNavigationContainerId)) {
    render(<LeftNavigation />, document.getElementById(leftNavigationContainerId));
  }
});
