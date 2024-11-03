import React, { createContext, FC, useContext } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import translationConfig from '../translation.config';

type TranslateFunction = WithTranslationsProps['translate'];

const NotificationLocalizationContext = createContext<TranslateFunction>(
  (resourceId, params) => resourceId
);

const NotificationLocalizationComponent: FC<WithTranslationsProps> = ({ children, translate }) => {
  return (
    <NotificationLocalizationContext.Provider value={translate}>
      {children}
    </NotificationLocalizationContext.Provider>
  );
};

const useNotificationLocalization = (): TranslateFunction => {
  return useContext(NotificationLocalizationContext);
};

const NotificationLocalizationProvider = withTranslations(
  NotificationLocalizationComponent,
  translationConfig
);

export {
  NotificationLocalizationContext,
  useNotificationLocalization,
  NotificationLocalizationProvider
};
