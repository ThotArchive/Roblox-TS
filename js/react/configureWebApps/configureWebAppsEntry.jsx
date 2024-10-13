import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import ConfigurationPanel from './components/ConfigurationPanel';

import configureWebApps from '../../../ts/webAppsConfiguration/configuration';
import '../../../css/configureWebApps/configureWebApps.scss';
import staticBundlesInfo from '../../../ts/webAppsConfiguration/staticBundlesInfo';

ready(() => {
  // TODO : NEED TO FIGURE OUT HOW TO ENABLE THIS UI
  if (document.getElementById('web-app-configuration-enabled') === 'True') {
    render(<ConfigurationPanel />, document.body.appendChild(document.createElement('DIV')));
  }
});

// here is code to enable console setup
window.ConfigureWebApps = configureWebApps;
window.StaticBundlesInfo = staticBundlesInfo;
