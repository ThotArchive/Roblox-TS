import React from 'react';
import Roblox from 'Roblox';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { rootElementId } from './app.config';
import App from './App';
import '../../../css/accessManagementUpsellV2/accessManagementUpsellV2.scss';
import { startAccessManagementUpsell } from './services/accessManagementUpsellService';

// Expose service to internal apps
Roblox.AccessManagementUpsellV2Service = { startAccessManagementUpsell };

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
