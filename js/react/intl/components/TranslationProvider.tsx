import React, { createContext } from 'react';
import { Intl, RobloxIntl, TranslationResourceProvider } from 'Roblox';
import { WithTranslationsProps as TTranslationContext, TranslationConfig } from 'react-utilities';
import validateTranslationConfig from '../validateTranslationConfig';

const createTranslationContext = (translationConfig: TranslationConfig): TTranslationContext => {
  const validatedConfig = validateTranslationConfig(translationConfig) as TranslationConfig;
  const { feature, common } = validatedConfig;
  const intl = new Intl() as RobloxIntl;
  const translationProvider = new TranslationResourceProvider(intl);
  const translationResources = [...common, feature]
    .filter(namespace => !!namespace)
    .map(namespace => translationProvider.getTranslationResource(namespace));
  const languageResources = translationProvider.mergeTranslationResources(...translationResources);

  const translate = (key: string, params: { [key: string]: string }) => {
    return languageResources.get(key, params);
  };

  return { translate, intl };
};

export const TranslationContext = createContext<TTranslationContext>(undefined);

/**
 * Wraps the ReactNode with `WithTranslationProps. Also see
 * ./hooks/useTranslation on how to conveniently access the context provided
 * here.
 */
export const TranslationProvider = ({
  config,
  children
}: {
  config: TranslationConfig;
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <TranslationContext.Provider value={createTranslationContext(config)}>
      {children}
    </TranslationContext.Provider>
  );
};
