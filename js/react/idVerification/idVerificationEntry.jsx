import React from 'react';
import Roblox from 'Roblox';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { rootElementId } from './app.config';
import '../../../css/idVerification/emailUpsell.scss';
import '../../../css/idVerification/viewTemplate.scss';
import App from './App';
import {
  getPersonaVerificationStatus,
  getVerifiedAge,
  startVerificationFlow,
  sendIdVerificationEvent
} from './services/ageVerificationServices';
import { showVoiceOptInOverlay, showAvatarVideoOptInOverlay } from './services/voiceChatService';

// Expose service to internal apps
Roblox.IdentityVerificationService = {
  getPersonaVerificationStatus,
  getVerifiedAge,
  startVerificationFlow,
  sendIdVerificationEvent,
  showVoiceOptInOverlay,
  showAvatarVideoOptInOverlay
};

async function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint) {
    const entryAttr = entryPoint.getAttribute('entry');

    render(<App entry={entryAttr || undefined} />, entryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(renderApp);
  }
}
ready(async () => {
  if (rootElementId) {
    await renderApp();
  }
});
