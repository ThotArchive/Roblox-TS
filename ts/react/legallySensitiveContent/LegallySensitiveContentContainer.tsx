import React, { useEffect } from 'react';
import Roblox from 'Roblox';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { useTranslatedLegallySensitiveContentAndActions } from './services/legallySensitiveContentService';
import UserSetting from './enums/UserSetting';
import { legallySensitiveContentTranslationConfig } from '../accessManagementUpsellV2/app.config';

// This container is used to expose the legally sensitive language service to the rest of the app
export const LegallySensitiveContentContainer = ({
  translate
}: {
  translate: TranslateFunction;
}): JSX.Element => {
  useEffect(() => {
    Roblox.LegallySensitiveContentService = {
      useLegallySensitiveContentAndActions: (settingName: UserSetting) =>
        useTranslatedLegallySensitiveContentAndActions(translate, settingName)
    };
  }, []);

  return <div id='legally-sensitive-content-component' />;
};

export default withTranslations(
  LegallySensitiveContentContainer,
  legallySensitiveContentTranslationConfig
);
