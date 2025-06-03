import SingleItemCollectionComponent from '../components/SingleItemCollection';
import VerticalFeedComponent from '../components/VerticalFeed';
import HeroUnitComponent from '../components/HeroUnit';
import PlayButtonComponent from '../components/SduiPlayButton';
import wrapComponentForSdui, { TSduiComponentProps } from './wrapComponentForSdui';
import SduiParsers from './SduiParsers';
import { TAnalyticsContext } from './SduiTypes';

export enum SduiRegisteredComponents {
  SingleItemCollection = 'SingleItemCollection',
  VerticalFeed = 'VerticalFeed',
  HeroUnit = 'HeroUnit',
  PlayButton = 'PlayButton'
}

type TSduiComponentInfo = {
  component: React.ComponentType<TSduiComponentProps>;
  propParsers?: {
    [propName: string]: (value: unknown, analyticsContext: TAnalyticsContext) => unknown;
  };
};

// Maps component type to component and prop parsers
export const SduiComponentMapping: Record<
  keyof typeof SduiRegisteredComponents,
  TSduiComponentInfo
> = {
  [SduiRegisteredComponents.SingleItemCollection]: {
    component: wrapComponentForSdui(SingleItemCollectionComponent),
    propParsers: {}
  },
  [SduiRegisteredComponents.VerticalFeed]: {
    component: wrapComponentForSdui(VerticalFeedComponent),
    propParsers: {}
  },
  [SduiRegisteredComponents.PlayButton]: {
    component: wrapComponentForSdui(PlayButtonComponent),
    propParsers: {}
  },
  [SduiRegisteredComponents.HeroUnit]: {
    component: wrapComponentForSdui(HeroUnitComponent),
    propParsers: {
      backgroundComponent: SduiParsers.parseUiComponent,
      bottomRowComponent: SduiParsers.parseUiComponent,
      ctaButtonComponent: SduiParsers.parseUiComponent,
      headerComponent: SduiParsers.parseUiComponent,
      onActivated: SduiParsers.parseCallback,
      overlayComponent: SduiParsers.parseUiComponent,
      asset: SduiParsers.parseHeroUnitAsset,
      gradient: SduiParsers.parseGradient,
      foregroundImage: SduiParsers.parseAssetUrlIntoComponent,
      backgroundImage: SduiParsers.parseAssetUrlIntoComponent
    }
  }
};

/**
 * Returns component for a given component type, or null
 *
 * Error logging for missing components is handled by the caller
 */
export const getComponentFromType = (
  componentType: keyof typeof SduiRegisteredComponents
): React.ComponentType<TSduiComponentProps> | null => {
  if (SduiComponentMapping[componentType]) {
    return SduiComponentMapping[componentType].component;
  }

  return null;
};

export default {
  getComponentFromType
};
