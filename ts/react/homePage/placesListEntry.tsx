import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { fireEvent } from 'roblox-event-tracker';
import HomePage from './HomePageOmniFeed';
import { homePageContainer, placesListContainer } from '../common/constants/browserConstants';
import '../../../css/placesList/realtimePlacelist.scss';
import '../../../../../Roblox.ReminderOfNorms.WebApp/Roblox.ReminderOfNorms.WebApp/css/reminderOfNorms.scss';
import HomePageContainer from './HomePageContainer';

ready(() => {
  if (homePageContainer()) {
    render(<HomePage />, homePageContainer());
  } else if (placesListContainer() && document.getElementById('content')) {
    // need to render in content div for css to work properly
    render(<HomePageContainer />, document.getElementById('content'));
  } else {
    fireEvent('HomePageMissingContainerDiv');
  }
});
