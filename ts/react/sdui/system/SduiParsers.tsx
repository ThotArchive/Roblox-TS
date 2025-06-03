import React from 'react';
import {
  Thumbnail2d,
  ThumbnailGameIconSize,
  ThumbnailAssetsSize,
  ThumbnailTypes,
  ThumbnailFormat
} from 'roblox-thumbnails';
import SduiComponent from './SduiComponent';
import { TSduiGradient } from '../components/HeroUnit';
import AssetImage from '../components/AssetImage';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import SduiActionHandlerRegistry, { TSduiActionConfig } from './SduiActionHandlerRegistry';
import {
  TAnalyticsContext,
  TAssetUrlData,
  THeroUnitAsset,
  TOmniRecommendationSduiTree,
  TServerDrivenComponentConfig,
  TUrlType
} from './SduiTypes';
import { getComponentFromType } from './SduiComponentRegistry';
import executeAction from './executeAction';

export const DEFAULT_GRADIENT: TSduiGradient = {
  startColor: '#000000',
  endColor: '#000000',
  startOpacity: 0,
  endOpacity: 1,
  // Subtract 90 from Lua default of 270 to account for angle handling difference
  degree: 180
};

const isValidSduiFeedItemArray = (input: unknown): input is TServerDrivenComponentConfig[] => {
  if (!Array.isArray(input)) {
    return false;
  }

  return input.every(item => typeof item === 'object' && item !== null);
};

export const extractValidSduiFeedItem = (
  sduiRoot: TOmniRecommendationSduiTree | undefined,
  feedItemKey: string
): TServerDrivenComponentConfig | undefined => {
  if (sduiRoot === undefined || !isValidSduiFeedItemArray(sduiRoot?.feed?.props?.feedItems)) {
    logSduiError(
      SduiErrorNames.ServerDrivenFeedItemMissingFeedOrFeedItems,
      `SDUI missing feed items, root is ${JSON.stringify(sduiRoot)}`
    );

    return undefined;
  }

  const { feedItems } = sduiRoot.feed.props;

  const sduiFeedItem = feedItems.find(feedItem => feedItem.feedItemKey === feedItemKey);

  if (!sduiFeedItem) {
    logSduiError(
      SduiErrorNames.ServerDrivenFeedItemMissingItem,
      `SDUI feed items ${JSON.stringify(
        feedItems
      )} missing matching feed item with key ${feedItemKey}`
    );

    return undefined;
  }

  return sduiFeedItem;
};

export const isValidSduiComponentConfig = (
  input: unknown
): input is TServerDrivenComponentConfig => {
  if (input && typeof input === 'object') {
    const componentConfig = input as TServerDrivenComponentConfig;

    if (componentConfig.componentType && getComponentFromType(componentConfig.componentType)) {
      return true;
    }
  }

  return false;
};

export const parseUiComponent = (
  input: unknown,
  analyticsContext: TAnalyticsContext
): JSX.Element => {
  if (!isValidSduiComponentConfig(input)) {
    logSduiError(
      SduiErrorNames.SduiParseUiComponentInvalidConfig,
      `Invalid component config ${JSON.stringify(input)} to parse UI component`
    );

    return <React.Fragment />;
  }

  return <SduiComponent componentConfig={input} parentAnalyticsContext={analyticsContext} />;
};

const isValidActionConfig = (input: unknown): input is TSduiActionConfig => {
  if (input && typeof input === 'object') {
    const actionConfig = input as TSduiActionConfig;

    if (
      actionConfig.actionType &&
      actionConfig.actionParams &&
      SduiActionHandlerRegistry[actionConfig.actionType]
    ) {
      return true;
    }
  }

  return false;
};

export const parseCallback = (
  input: unknown,
  analyticsContext: TAnalyticsContext
): (() => void) => {
  if (!isValidActionConfig(input)) {
    logSduiError(
      SduiErrorNames.SduiParseCallbackInvalidConfig,
      `Invalid action config ${JSON.stringify(input)} to parse callback`
    );
    return () => undefined;
  }

  return () => executeAction(input, analyticsContext);
};

const isValidHeroUnitAssetConfig = (input: unknown): input is THeroUnitAsset => {
  if (typeof input === 'object') {
    const assetConfig = input as THeroUnitAsset;

    if (assetConfig.image && assetConfig.title && assetConfig.subtitle) {
      return true;
    }
  }

  return false;
};

export const parseAssetUrl = (input: unknown): TAssetUrlData => {
  if (typeof input !== 'string') {
    logSduiError(
      SduiErrorNames.SduiParseAssetUrlInvalidInput,
      `Invalid asset url input ${JSON.stringify(input)}. Input must be a string.`
    );

    return {
      assetType: undefined,
      assetTarget: '0'
    };
  }

  const split = input.split('//');

  if (
    split.length === 2 &&
    (input.includes(TUrlType.RbxAsset) || input.includes(TUrlType.RbxThumb))
  ) {
    if (split[0].includes(TUrlType.RbxAsset)) {
      return {
        assetType: TUrlType.RbxAsset,
        assetTarget: split[1]
      };
    }
    if (split[0].includes(TUrlType.RbxThumb)) {
      return {
        assetType: TUrlType.RbxThumb,
        assetTarget: split[1]
      };
    }
  }

  // TODO https://roblox.atlassian.net/browse/CLIGROW-2206: Support direct CDN URLs for assets

  logSduiError(SduiErrorNames.SduiParseAssetUrlInvalidFormat, `Invalid asset url format ${input}`);

  return {
    assetType: undefined,
    assetTarget: '0'
  };
};

export const parseRbxThumbUrlData = (
  input: string
): {
  thumbnailType: string | undefined;
  id: string | undefined;
  w: string | undefined;
  h: string | undefined;
} => {
  const split = input.split('&');

  const info: Record<string, string> = {};

  split.forEach(item => {
    const [key, value] = item.split('=');

    info[key] = value;
  });

  return {
    thumbnailType: info.type,
    id: info.id,
    w: info.w,
    h: info.h
  };
};

type TSupportedThumbnailSize = ThumbnailGameIconSize | ThumbnailAssetsSize;

const thumbnailTypeToSizeMap: Record<string, TSupportedThumbnailSize[]> = {
  [ThumbnailTypes.gameIcon]: Object.values(ThumbnailGameIconSize),
  [ThumbnailTypes.assetThumbnail]: Object.values(ThumbnailAssetsSize)
};

const getSupportedThumbnailSize = (
  thumbnailType: string,
  w: string,
  h: string
): TSupportedThumbnailSize | undefined => {
  const thumbnailSize = `${w}x${h}`;

  return thumbnailTypeToSizeMap[thumbnailType]?.find(size => size === thumbnailSize);
};

export const parseAssetUrlIntoComponent = (input: unknown): JSX.Element => {
  if (typeof input !== 'string') {
    return <React.Fragment />;
  }

  const { assetType, assetTarget } = parseAssetUrl(input);

  if (assetType === TUrlType.RbxAsset) {
    const id = assetTarget;

    return <AssetImage assetId={id} />;
  }

  if (assetType === TUrlType.RbxThumb) {
    const { thumbnailType, id, w, h } = parseRbxThumbUrlData(assetTarget);

    if (id !== undefined && thumbnailType !== undefined && w !== undefined && h !== undefined) {
      const supportedSize = getSupportedThumbnailSize(thumbnailType, w, h);

      if (supportedSize !== undefined) {
        return (
          <Thumbnail2d
            containerClass='sdui-thumbnail-container'
            type={thumbnailType}
            targetId={id}
            format={ThumbnailFormat.webp}
            size={supportedSize}
          />
        );
      }

      logSduiError(
        SduiErrorNames.SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType,
        `No supported thumbnail size ${w}x${h} for type ${thumbnailType}`
      );

      return <React.Fragment />;
    }

    logSduiError(
      SduiErrorNames.SduiParseAssetUrlIntoComponentInvalidRbxThumb,
      `Invalid rbxthumb url ${JSON.stringify(input)}. At least one of thumbnailType ${
        thumbnailType ?? 'undefined'
      } id ${id ?? 'undefined'}, w ${w ?? 'undefined'}, or h ${h ?? 'undefined'} is invalid`
    );

    return <React.Fragment />;
  }

  logSduiError(
    SduiErrorNames.SduiParseAssetUrlIntoComponentInvalidAssetType,
    `Invalid asset type ${JSON.stringify(assetType)}. Only RbxThumb and RbxAsset are supported.`
  );

  return <React.Fragment />;
};

const parseHeroUnitAsset = (input: unknown): THeroUnitAsset => {
  if (!isValidHeroUnitAssetConfig(input)) {
    // TODO https://roblox.atlassian.net/browse/CLIGROW-2200
    // Update default Hero Unit asset
    return {
      image: <React.Fragment />,
      title: 'Hero Unit Asset Title',
      subtitle: 'Hero Unit Asset Subtitle'
    };
  }

  const assetComponent = parseAssetUrlIntoComponent(input.image);

  return {
    ...input,
    image: assetComponent
  };
};

export const isValidGradient = (input: unknown): input is TSduiGradient => {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const gradientConfig = input as TSduiGradient;

  if (!gradientConfig.startColor || typeof gradientConfig.startColor !== 'string') {
    return false;
  }

  if (!gradientConfig.endColor || typeof gradientConfig.endColor !== 'string') {
    return false;
  }

  if (
    gradientConfig.startOpacity === undefined ||
    typeof gradientConfig.startOpacity !== 'number'
  ) {
    return false;
  }

  if (gradientConfig.endOpacity === undefined || typeof gradientConfig.endOpacity !== 'number') {
    return false;
  }

  if (gradientConfig.degree === undefined || typeof gradientConfig.degree !== 'number') {
    return false;
  }

  return true;
};

export const parseGradient = (input: unknown): TSduiGradient => {
  if (!isValidGradient(input)) {
    logSduiError(
      SduiErrorNames.SduiParseGradientInvalidConfig,
      `Invalid gradient config ${JSON.stringify(input)}`
    );
    return DEFAULT_GRADIENT;
  }

  const finalGradient = {
    ...input,
    // Subtract 90 degrees to account for Lua angle degree handling difference
    degree: (input.degree - 90 + 360) % 360
  };

  // Add missing # prefix to Hex colors if necessary
  if (!input.startColor.startsWith('#')) {
    finalGradient.startColor = `#${input.startColor}`;
  }
  if (!input.endColor.startsWith('#')) {
    finalGradient.endColor = `#${input.endColor}`;
  }

  return finalGradient;
};

export default {
  parseUiComponent,
  parseCallback,
  parseHeroUnitAsset,
  parseAssetUrl,
  parseAssetUrlIntoComponent,
  parseGradient
};
