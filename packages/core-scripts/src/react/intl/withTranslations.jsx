import React from "react";
import Intl from "@rbx/core-scripts/intl";
import { TranslationResourceProvider } from "@rbx/core-scripts/intl/translation";
import amendHOCDebuggingInfo from "../utils/amendHOCDebuggingInfo";
import validateTranslationConfig from "./validateTranslationConfig";

const withTranslations = (WrappedComponent, translationConfig) => {
  const validatedConfig = validateTranslationConfig(translationConfig);
  // TODO: old, migrated code
  // eslint-disable-next-line react/display-name
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.intl = new Intl();
      this.translate = this.translate.bind(this);

      const { common, feature, features } = validatedConfig;
      const translationProvider = new TranslationResourceProvider(this.intl);
      const languageResources = [...common, feature, ...(features ?? [])]
        .filter(namespace => namespace !== undefined)
        .map(namespace => translationProvider.getTranslationResource(namespace));

      this.state = {
        languageResources: translationProvider.mergeTranslationResources(...languageResources),
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
};

export default amendHOCDebuggingInfo(withTranslations, "withTranslations");
