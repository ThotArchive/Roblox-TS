import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import AccessManagementUpsellContainer from './container/AccessManagementUpsellContainer';
import { accessManagementUpsellTranslationConfig } from './app.config';

function App({ translate }: WithTranslationsProps) {
  return <AccessManagementUpsellContainer translate={translate} />;
}

export default withTranslations(App, accessManagementUpsellTranslationConfig);
