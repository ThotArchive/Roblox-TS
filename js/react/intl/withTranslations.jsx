import React from 'react';
import { Intl, TranslationResourceProvider } from 'Roblox';
import ammendHOCDebuggingInfo from '../utils/amendHOCDebuggingInfo';
import validateTranslationConfig from './validateTranslationConfig';

function withTranslations(WrappedComponent, translationConfig) {
  const validatedConfig = validateTranslationConfig(translationConfig);
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.intl = new Intl();
      this.translate = this.translate.bind(this);

      const { common, feature } = validatedConfig;
      const translationProvider = new TranslationResourceProvider(this.intl);
      const languageResources = [...common, feature]
        .filter(namespace => !!namespace)
        .map(namespace => translationProvider.getTranslationResource(namespace));

      this.state = {
        languageResources: translationProvider.mergeTranslationResources(...languageResources)
      };
    }

    translate(key, params) {
      const { languageResources } = this.state;
      return languageResources.get(key, params);
    }

    render() {
      return <WrappedComponent {...this.props} translate={this.translate} intl={this.intl} />;
    }
  };
}

export default ammendHOCDebuggingInfo(withTranslations, 'withTranslations');
