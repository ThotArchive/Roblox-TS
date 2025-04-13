import { ready } from 'core-utilities';
import React from 'react';
import Roblox from 'Roblox';
import { render } from 'react-dom';
import bannerConstants from './constants/bannerConstants';
import CookieBannerV3Base from './containers/CookieBannerV3Base';
import '../../../css/cookieBannerV3/cookieBannerV3.scss';
import useConsentTools from './hooks/useConsentTools';

const entryPoint = document.getElementById(bannerConstants.cookieBannerContainerId);
// Expose service to internal apps
Roblox.Cookies.useConsentTool = useConsentTools;

ready(() => {
  if (entryPoint) {
    render(<CookieBannerV3Base />, entryPoint);
  }
});
