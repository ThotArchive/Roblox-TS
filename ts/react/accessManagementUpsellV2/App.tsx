import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Provider } from 'react-redux';
import AccessManagementContainer from './accessManagement/AccessManagementContainer';
import { store } from './store';
import { accessManagementUpselTranslationConfig } from './app.config';

function App({ translate }: WithTranslationsProps) {
  return (
    <Provider store={store}>
      <AccessManagementContainer translate={translate} />
    </Provider>
  );
}
export default withTranslations(App, accessManagementUpselTranslationConfig);
