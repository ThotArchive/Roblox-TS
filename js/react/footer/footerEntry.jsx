import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { rootElementId, accountSettingsLanguageSelectorId } from './app.config';
import { infoTabHash, accountSettingsPathname } from './constants/footerConstants';
import App from './App';
import AccountSettingsLanguageSelector from './components/AccountSettingsLanguageSelector';

import '../../../css/footer/footer.scss';

ready(() => {
  const rootElement = document.getElementById(rootElementId);
  if (rootElement) {
    render(<App />, rootElement);
  }

  /* add langauge selector on account settings, if mount node is available
   * Note: This change is temporary until account settings page is moved to WebApp
   */
  let accountSettingsMountNode = document.getElementById(accountSettingsLanguageSelectorId);

  let retryAttempts = 10;
  const retryGettingAccountSettingMountNode = () => {
    accountSettingsMountNode = document.getElementById(accountSettingsLanguageSelectorId);
    if (!accountSettingsMountNode && retryAttempts > 0) {
      retryAttempts -= 1;
      setTimeout(retryGettingAccountSettingMountNode, 200);
    } else if (accountSettingsMountNode) {
      render(<AccountSettingsLanguageSelector />, accountSettingsMountNode);
    }
  };

  // this runs on page load, if user lands on /#info this should render
  retryGettingAccountSettingMountNode();

  /* Angular fix to watch for a tab change and re-render language selector if needed
   * This logic will also take care of case when user doesn't land on /#info first
   */
  if (window.location.pathname.toLowerCase().indexOf(accountSettingsPathname) > -1) {
    window.onhashchange = () => {
      if (window.location.hash === infoTabHash) {
        const newAccountSettingsMountNode = document.getElementById(
          accountSettingsLanguageSelectorId
        );
        if (newAccountSettingsMountNode) {
          render(<AccountSettingsLanguageSelector />, newAccountSettingsMountNode);
        }
      }
    };
  }
});
