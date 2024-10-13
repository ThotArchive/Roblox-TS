import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import Roblox from 'Roblox';
import ReactLandingService from './services/landingService';
import ReactLandingEventService from './services/eventService';
import ReactSignupService from './services/signupService';
import ReactSignupUtils from './utils/signupUtils';
import ReactIdentityVerificationUtils from './utils/identityVerificationUtils';
import { getIsReactUIEnabled } from './utils/landingUtils';
import LandingPageContainer from './containers/LandingPageContainer';
import LandingPageContainerHybrid from './containers/LandingPageContainerHybrid';
import { landingPageContainer } from '../common/constants/browserConstants';
import '../../../css/landing/signup.scss';
import '../../../css/landing/landing.scss';
import '../../../css/landing/landingPage.scss';

Object.assign(Roblox, {
  ReactLandingService
});

Object.assign(Roblox, {
  ReactSignupService
});

Object.assign(Roblox, {
  ReactLandingEventService
});

// Utils will be removed after migration complete, needed for hybrid for now
Object.assign(Roblox, {
  ReactSignupUtils
});

Object.assign(Roblox, {
  ReactIdentityVerificationUtils
});

function renderApp() {
  const entryPoint = landingPageContainer();
  if (entryPoint) {
    if (getIsReactUIEnabled()) {
      render(<LandingPageContainer />, entryPoint);
    } else {
      render(<LandingPageContainerHybrid />, entryPoint);
    }
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});
