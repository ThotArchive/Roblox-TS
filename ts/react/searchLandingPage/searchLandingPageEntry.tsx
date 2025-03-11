import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { fireEvent } from 'roblox-event-tracker';
import Roblox from 'Roblox';
import { rootElementId } from './app.config';
import '../../../css/searchLandingPage/searchLandingPage.scss';
import SearchLandingPageOmniFeed from './SearchLandingPageOmniFeed';
import SearchLandingService from './service/searchLandingService';
import { ModalEvent } from './service/modalConstants';
import { searchLandingPage } from '../common/constants/configConstants';

// Expose service to internal apps
Roblox.SearchLandingService = SearchLandingService;

function renderApp() {
  const entryPoint = document.getElementById(rootElementId);
  if (entryPoint === null) {
    fireEvent(searchLandingPage.searchLandingPageMountError);
    return;
  }

  render(<SearchLandingPageOmniFeed />, entryPoint);
}

ready(() => {
  window.addEventListener(ModalEvent.MountSearchLanding, () => {
    renderApp();
  });
});
