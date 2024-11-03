import { ready } from 'core-utilities';
import React from 'react';
import { render } from 'react-dom';
import App from './App';

import '../../../css/reminderOfNorms.scss';

const ROOT_ELEMENT_ID = 'reminder-of-norms-web-app-root';

ready(() => {
  render(<App />, document.getElementById(ROOT_ELEMENT_ID));
});
