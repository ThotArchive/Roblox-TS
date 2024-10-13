/* eslint-disable jsx-a11y/anchor-has-content */

import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { appStoreLinksConfig } from '../translation.config';
import { landingPageStrings, appStoreLinkConstants } from '../constants/appStoreLinkConstants';
import AppStoreLink from './AppStoreLink';

export type appStoreContainerProps = {
  onAppClick: (appName: string) => void;
  translate: WithTranslationsProps['translate'];
};

const AppStoreContainer = ({ onAppClick, translate }: appStoreContainerProps): JSX.Element => {
  return (
    <div id='app-stores-container'>
      <div id='app-stores'>
        <div id='app-stores-devices'>
          <h4>
            <span>{translate(landingPageStrings.robloxOnDevice)}</span>
          </h4>
        </div>
        {appStoreLinkConstants.map(appStore => (
          <AppStoreLink
            href={appStore.href}
            className={appStore.className}
            onAppClick={onAppClick}
            name={appStore.name}
            title={appStore.title}
            translate={translate}
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslations(AppStoreContainer, appStoreLinksConfig);
