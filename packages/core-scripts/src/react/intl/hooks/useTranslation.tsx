import { useContext } from "react";
import { WithTranslationsProps } from "../../intl";
import { TranslationContext } from "../components/TranslationProvider";

/**
 * To be used along side ./components/TranslationProvider, this hook gives
 * convenient access to translation props configured by the closest
 * TranslationProvider ancestor in a React tree.
 *
 * @returns WithTranslationsProps
 */
const useTranslation: () => WithTranslationsProps = () => {
  const translationProps = useContext(TranslationContext);

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!translationProps) {
    throw Error(
      "invalid use of `useTranslation` hook. Ensure your component has an ancestor wrapped in `TranslationProvider`",
    );
  }

  return translationProps;
};

export default useTranslation;
