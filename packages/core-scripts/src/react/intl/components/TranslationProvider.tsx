import { JSX, createContext } from "react";
import Intl from "@rbx/core-scripts/intl";
import {
  TranslationResourceProvider,
  TranslationResource,
} from "@rbx/core-scripts/intl/translation";
import { TranslateFunction, TranslationConfig, WithTranslationsProps } from "../../intl";
import validateTranslationConfig from "../validateTranslationConfig";

const createTranslationContext = (translationConfig: TranslationConfig): WithTranslationsProps => {
  const validatedConfig = validateTranslationConfig(translationConfig);
  const { feature, common, features } = validatedConfig;
  const intl = new Intl();
  const translationProvider = new TranslationResourceProvider(intl);
  const translationResources = [...common, feature, ...(features ?? [])]
    .filter(namespace => namespace !== undefined)
    .map(namespace => translationProvider.getTranslationResource(namespace));
  const languageResources: TranslationResource = translationProvider.mergeTranslationResources(
    ...translationResources,
  );

  const translate: TranslateFunction = (key: string, params?: Record<string, unknown>): string =>
    languageResources.get(key, params);

  return { translate, intl };
};

// @ts-expect-error TODO: old, migrated code
export const TranslationContext = createContext<WithTranslationsProps>(undefined);

/**
 * Wraps the ReactNode with `WithTranslationProps. Also see
 * ./hooks/useTranslation on how to conveniently access the context provided
 * here.
 */
export function TranslationProvider({
  config,
  children,
}: {
  config: TranslationConfig;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <TranslationContext.Provider value={createTranslationContext(config)}>
      {children}
    </TranslationContext.Provider>
  );
}
