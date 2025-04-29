import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import ReminderOfNormsDialogContainer from '../../../../../Roblox.ReminderOfNorms.WebApp/Roblox.ReminderOfNorms.WebApp/ts/react/reminderOfNorms/containers/ReminderOfNormsContainer';
import HomePage from './HomePageOmniFeed';
import { CommonUIFeatures } from '../common/constants/translationConstants';

const HomePageContainer = ({ translate }: WithTranslationsProps): JSX.Element => {
  return (
    <div id='HomeContainer' className='row home-container expand-max-width'>
      <div className='section'>
        <div className='col-xs-12 container-header'>
          <h1>{translate(CommonUIFeatures.LabelsHome)}</h1>
        </div>
      </div>
      <div>
        <ReminderOfNormsDialogContainer />
      </div>
      <div className='place-list-container'>
        <HomePage />
      </div>
    </div>
  );
};

export default withTranslations(HomePageContainer, {
  common: [],
  feature: 'CommonUI.Features'
});
