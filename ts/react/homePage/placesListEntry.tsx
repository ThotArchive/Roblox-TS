import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import HomePage from './HomePageOmniFeed';
import { homePageContainer } from '../common/constants/browserConstants';
import '../../../css/placesList/realtimePlacelist.scss';

ready(() => {
  if (homePageContainer()) {
    render(<HomePage />, homePageContainer());
  }
});
