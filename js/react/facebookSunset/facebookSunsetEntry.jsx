import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import Roblox from 'Roblox';
import App from './App';
import '../../../css/facebookSunsetModal/facebookSunsetModal.scss';
import { rootElementId } from './app.config';
import { openFacebookSunsetModal } from './services/facebookSunsetService';

Roblox.FacebookSunsetService = {
  openFacebookSunsetModal
};

function renderApp() {
  if (document.getElementById(rootElementId)) {
    render(<App />, document.getElementById(rootElementId));
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
