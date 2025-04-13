import React from 'react';
import {
  Thumbnail2d,
  ThumbnailGameIconSize,
  ThumbnailAssetsSize,
  ThumbnailTypes,
  ThumbnailFormat
} from 'roblox-thumbnails';
import type { FoundationTokens } from 'react-utilities';
import SduiComponent from './SduiComponent';
import { TSduiGradient } from '../components/HeroUnit';
import AssetImage from '../components/AssetImage';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import SduiActionHandlerRegistry, { TSduiActionConfig } from './SduiActionHandlerRegistry';
import {
  TAnalyticsContext,
  TAssetUrlData,
  TAutomaticSize,
  TFoundationToken,
  THeroUnitAsset,
  TOmniRecommendationSduiTree,
  TSduiContext,
  TServerDrivenComponentConfig,
  TTypographyToken,
  TUDim2,
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
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): JSX.Element => {
  if (!isValidSduiComponentConfig(input)) {
    logSduiError(
      SduiErrorNames.SduiParseUiComponentInvalidConfig,
      `Invalid component config ${JSON.stringify(input)} to parse UI component`
    );

    return <React.Fragment />;
  }

  return (
    <SduiComponent
      componentConfig={input}
      parentAnalyticsContext={analyticsContext}
      sduiContext={sduiContext}
    />
  );
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
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): (() => void) => {
  if (!isValidActionConfig(input)) {
    logSduiError(
      SduiErrorNames.SduiParseCallbackInvalidConfig,
      `Invalid action config ${JSON.stringify(input)} to parse callback`
    );
    return () => undefined;
  }

  return () => executeAction(input, analyticsContext, sduiContext);
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

/**
 * Parses a foundation token string into either a string, number, or object result.
 *
 * Returns undefined and logs an error if the input is invalid or not found.
 */
export const parseFoundationTokenHelper = (
  input: unknown,
  allTokens: FoundationTokens
): TFoundationToken | undefined => {
  if (!allTokens) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenMissingTokens,
      `Missing tokens in parseFoundationTokenHelper for input ${JSON.stringify(input)}`
    );

    return undefined;
  }

  if (typeof input !== 'string') {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidInput,
      `Invalid input ${JSON.stringify(input)} for foundation token. Input must be a string.`
    );

    return undefined;
  }

  const splitInput = input.split('.');

  let currentToken: TFoundationToken = allTokens;

  for (let i = 0; i < splitInput.length; ++i) {
    const tokenPathStep = splitInput[i];

    // Verify the current token exists and can be indexed by tokenPathStep (object and not array)
    if (
      currentToken === undefined ||
      currentToken === null ||
      typeof currentToken !== 'object' ||
      Array.isArray(currentToken)
    ) {
      logSduiError(
        SduiErrorNames.SduiParseFoundationTokenInvalidInputPath,
        `Invalid token path ${input}. Token path step ${tokenPathStep} is invalid. Token is ${JSON.stringify(
          currentToken
        )}`
      );

      return undefined;
    }

    currentToken = currentToken[tokenPathStep];
  }

  // Verify the final token is not null or undefined
  if (currentToken === null || currentToken === undefined) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidInputPath,
      `Invalid token path ${input}. The final token ${
        currentToken ? JSON.stringify(currentToken) : 'undefined'
      } is invalid.`
    );

    return undefined;
  }

  return currentToken;
};

/**
 * Parses the input into a number.
 *
 * Supports direct number inputs and foundation number tokens.
 */
export const parseFoundationNumberToken = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): number | undefined => {
  if (typeof input === 'number') {
    return input;
  }

  const token = parseFoundationTokenHelper(input, sduiContext.dependencies.tokens);

  if (token === undefined || typeof token !== 'number') {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
      `Invalid output type ${typeof token} for token ${JSON.stringify(
        token
      )} with input ${JSON.stringify(input)}. Expected number.`
    );

    return undefined;
  }

  return token;
};

const isValidTypographyToken = (input: unknown): input is TTypographyToken => {
  if (!input || typeof input !== 'object') {
    return false;
  }

  return true;
};

/**
 * Parses the input into a typography token.
 *
 * Supports direct typography token objects and foundation typography tokens.
 */
export const parseFoundationTypographyToken = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): TTypographyToken | undefined => {
  if (isValidTypographyToken(input)) {
    return input;
  }

  const token = parseFoundationTokenHelper(input, sduiContext.dependencies.tokens);

  if (token === undefined || !isValidTypographyToken(token)) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
      `Invalid output type ${typeof token}. Expected TypographyToken.`
    );

    return undefined;
  }

  return token;
};

export const parseFoundationStringToken = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): string | undefined => {
  const token = parseFoundationTokenHelper(input, sduiContext.dependencies.tokens);

  if (token !== undefined && typeof token === 'string') {
    return token;
  }

  logSduiError(
    SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
    `Invalid output type ${typeof token}. Expected string.`
  );

  return undefined;
};

export const isValidRgbColor = (input: unknown): input is string => {
  if (typeof input !== 'string') {
    return false;
  }

  return /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.test(input);
};

export const isValidRgbaColor = (input: unknown): input is string => {
  if (typeof input !== 'string') {
    return false;
  }

  return /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/.test(input);
};

export const parseFoundationColorToken = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): string | undefined => {
  if (isValidRgbColor(input) || isValidRgbaColor(input)) {
    return input;
  }

  const stringToken = parseFoundationStringToken(input, analyticsContext, sduiContext);

  if (stringToken && (isValidRgbColor(stringToken) || isValidRgbaColor(stringToken))) {
    return stringToken;
  }

  logSduiError(
    SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
    `Invalid output type ${typeof stringToken}. Expected color string.`
  );

  return undefined;
};

export const isValidHexColor = (input: unknown): input is string => {
  if (typeof input !== 'string') {
    return false;
  }

  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(input);
};

export const isValidHexColorWithoutHash = (input: unknown): input is string => {
  if (typeof input !== 'string') {
    return false;
  }

  return /^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(input);
};

/**
 * Parses the input into a hex, rgb, or rgba color string.
 *
 * Supports hex colors with or without a # prefix, rgb and rgba colors, and foundation color tokens.
 */
export const parseColorValue = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): string | undefined => {
  if (isValidHexColor(input)) {
    return input;
  }

  if (isValidHexColorWithoutHash(input)) {
    return `#${input}`;
  }

  const colorToken = parseFoundationColorToken(input, analyticsContext, sduiContext);

  if (colorToken) {
    return colorToken;
  }

  logSduiError(
    SduiErrorNames.SduiParseColorValueInvalidInput,
    `Invalid input ${JSON.stringify(
      input
    )} for color value. Input must be a hex color or a foundation color token.`
  );

  return undefined;
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

export const isValidUDim2 = (input: unknown): input is TUDim2 => {
  if (input && typeof input === 'object') {
    const uDim2 = input as TUDim2;

    if (
      uDim2.xScale !== undefined &&
      typeof uDim2.xScale === 'number' &&
      uDim2.xOffset !== undefined &&
      typeof uDim2.xOffset === 'number' &&
      uDim2.yScale !== undefined &&
      typeof uDim2.yScale === 'number' &&
      uDim2.yOffset !== undefined &&
      typeof uDim2.yOffset === 'number'
    ) {
      return true;
    }
  }

  return false;
};

export const convertArrayToUDim2 = (input: unknown): TUDim2 | undefined => {
  if (input && Array.isArray(input) && input.length === 4) {
    const [xScale, xOffset, yScale, yOffset] = input.map(Number);

    return { xScale, xOffset, yScale, yOffset };
  }

  return undefined;
};

/**
 * Parse either a string with 4 comma-separated values or
 * an array of 4 numbers into a UDim2 object.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const parseUDim2 = (input: unknown): TUDim2 | undefined => {
  if (isValidUDim2(input)) {
    return input;
  }

  const convertedInput = convertArrayToUDim2(input);

  if (isValidUDim2(convertedInput)) {
    return convertedInput;
  }

  if (!input || typeof input !== 'string') {
    logSduiError(
      SduiErrorNames.SduiParseUDim2InvalidInput,
      `Invalid input ${JSON.stringify(input)} for uDim2. Input must be a string.`
    );

    return undefined;
  }

  const split = input.split(',');

  const convertedSplitInput = convertArrayToUDim2(split);

  if (isValidUDim2(convertedSplitInput)) {
    return convertedSplitInput;
  }

  logSduiError(
    SduiErrorNames.SduiParseUDim2InvalidInput,
    `Invalid input ${JSON.stringify(
      input
    )} for uDim2. Input must be a string with 4 comma-separated values.`
  );

  return undefined;
};

/**
 * Parses the string input into a TAutomaticSize enum value.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const parseAutomaticSize = (input: unknown): TAutomaticSize | undefined => {
  if (!input || typeof input !== 'string') {
    logSduiError(
      SduiErrorNames.SduiParseAutomaticSizeInvalidInput,
      `Invalid input ${JSON.stringify(input)} for automatic size. Input must be a string.`
    );

    return undefined;
  }

  switch (input) {
    case TAutomaticSize.X:
      return TAutomaticSize.X;
    case TAutomaticSize.Y:
      return TAutomaticSize.Y;
    case TAutomaticSize.XY:
      return TAutomaticSize.XY;
    case TAutomaticSize.None:
      return TAutomaticSize.None;
    default: {
      logSduiError(
        SduiErrorNames.SduiParseAutomaticSizeInvalidInput,
        `Invalid automatic size ${JSON.stringify(input)}. Expected one of ${Object.values(
          TAutomaticSize
        ).join(', ')}.`
      );
      return undefined;
    }
  }
};

/**
 * Validate that the input value is of type Record<string, unkown>, which is an object with string keys or an empty object.
 */
export const isStringKeyObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).every(key => typeof key === 'string')
  );
};

export default {
  parseUiComponent,
  parseCallback,
  parseHeroUnitAsset,
  parseAssetUrl,
  parseAssetUrlIntoComponent,
  parseGradient,
  parseFoundationNumberToken,
  parseFoundationTypographyToken,
  parseColorValue,
  parseUDim2,
  parseAutomaticSize
};
