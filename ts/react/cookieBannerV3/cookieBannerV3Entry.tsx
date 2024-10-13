import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import bannerConstants from './constants/bannerConstants';
import CookieBannerV3Base from './containers/CookieBannerV3Base';
import '../../../css/cookieBannerV3/cookieBannerV3.scss';

const entryPoint = document.getElementById(bannerConstants.cookieBannerContainerId);

ready(() => {
  if (entryPoint) {
    render(<CookieBannerV3Base />, entryPoint);
  }
});
