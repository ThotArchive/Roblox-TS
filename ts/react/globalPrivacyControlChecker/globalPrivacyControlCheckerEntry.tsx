import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

import '../../../css/globalPrivacyControlChecker/globalPrivacyControlChecker.scss';

const globalPrivacyControlCheckerContainerId = 'global-privacy-control-checker-container';

ready(() => {
  const containerElement = document.getElementById(globalPrivacyControlCheckerContainerId);
  if (containerElement !== null) {
    render(<App />, containerElement);
  }
});
