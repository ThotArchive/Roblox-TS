import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

import '../../../css/userAgreementsChecker/userAgreementsChecker.scss';

const userAgreementsCheckerContainerId = 'user-agreements-checker-container';

ready(() => {
  const containerElement = document.getElementById(userAgreementsCheckerContainerId);
  if (containerElement !== null) {
    render(<App />, containerElement);
  }
});
