// eslint-disable-next-line no-restricted-imports
import {
  useDebounce,
  useInterval,
  useLocalStorage,
  useOnClickOutside,
  usePrevious,
  useWindowActiveState
} from '@rbx/react-utilities';
import { TranslationProvider } from './intl/components/TranslationProvider';
import makeActionCreator from './redux/makeActionCreator';
import withComponentStatus from './componentStatus/withComponentStatus';
import withTranslations from './intl/withTranslations';
import useTranslation from './intl/hooks/useTranslation';
import useTheme from './hooks/useTheme';
import useTokens from './hooks/useTokens';

// roblox core react utilities
window.ReactUtilities = {
  makeActionCreator,
  withComponentStatus,
  withTranslations,
  useTranslation,
  TranslationProvider,
  useDebounce,
  useInterval,
  useLocalStorage,
  useOnClickOutside,
  usePrevious,
  useWindowActiveState,
  useTheme,
  useTokens
};
