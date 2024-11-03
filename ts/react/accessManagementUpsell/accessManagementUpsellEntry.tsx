import React from 'react';
import Roblox from 'Roblox';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { rootElementId } from './app.config';
import '../../../css/accessManagementUpsell/accessManagementUpsell.scss';
import App from './App';
import { showAccessManagementVerificationModal } from './services/accessManagementUpsellService';

// Expose service to internal apps
Roblox.AccessManagementUpsellService = {
  showAccessManagementVerificationModal
};

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    render(<App />, entryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  if (rootElementId) {
    renderApp();
  }
});
