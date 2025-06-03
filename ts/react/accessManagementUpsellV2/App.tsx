import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Provider } from 'react-redux';
import AccessManagementContainer from './accessManagement/AccessManagementContainer';
import { store } from './store';
import { accessManagementUpselTranslationConfig } from './app.config';
import LegallySensitiveContentContainer from '../legallySensitiveContent/LegallySensitiveContentContainer';

function App({ translate }: WithTranslationsProps) {
  return (
    <Provider store={store}>
      <AccessManagementContainer translate={translate} />
      <LegallySensitiveContentContainer translate={translate} />
    </Provider>
  );
}
export default withTranslations(App, accessManagementUpselTranslationConfig);
