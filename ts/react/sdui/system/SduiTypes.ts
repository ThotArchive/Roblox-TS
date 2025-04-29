import type { FoundationTokens } from 'react-utilities';
import { TSduiActionConfig } from './SduiActionHandlerRegistry';
import { SduiRegisteredComponents } from './SduiComponentRegistry';

export type TAnalyticsData = Record<string, string | number | boolean>;

export type TSduiResponsiveConfig = {
  overrides: Record<string, unknown>;
  conditions?: Record<string, unknown>;
};

export type TServerDrivenComponentConfig = {
  componentType: keyof typeof SduiRegisteredComponents;
  props: Record<string, unknown>;

  analyticsData?: TAnalyticsData;

  feedItemKey?: string;

  children?: TServerDrivenComponentConfig[];

  responsiveProps?: TSduiResponsiveConfig[];
};

export type TOmniRecommendationSduiTree = {
  feed: TServerDrivenComponentConfig;
};

export interface TCollectionAnalyticsData extends TAnalyticsData {
  collectionId: number;
  contentType: string;
  itemsPerRow: number;
  collectionPosition: number;
  totalNumberOfItems: number;
}

export interface TItemAnalyticsData extends TAnalyticsData {
  id: string;
  itemPosition: number;
}

export type TAnalyticsContext = {
  analyticsData?: TAnalyticsData;

  ancestorAnalyticsData?: TAnalyticsData;

  getCollectionData?: () => TCollectionAnalyticsData;

  logAction?: (actionConfig: TSduiActionConfig, analyticsContext: TAnalyticsContext) => void;
};

export type TSduiContextDependencies = {
  tokens: FoundationTokens;
};

export type TSduiContext = {
  dependencies: TSduiContextDependencies;
};

// Expected props to be shared by all components after prop parsing
export interface TSduiCommonProps {
  componentConfig: TServerDrivenComponentConfig;

  analyticsContext: TAnalyticsContext;

  sduiContext: TSduiContext;
}

type TSduiPropParser = (
  value: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
) => unknown;

// Recursive definition to support nested prop parsers
export interface TSduiPropParserObject {
  [key: string]: TSduiPropParser | TSduiPropParserObject;
}

// Prop parsing types
export type THeroUnitAsset = {
  image: React.ReactNode;
  title: string;
  subtitle: string;
};

export enum TUrlType {
  RbxAsset = 'rbxassetid',
  RbxThumb = 'rbxthumb'
}

export type TAssetUrlData = {
  assetType: TUrlType | undefined;
  assetTarget: string;
};

interface TNestedFoundationToken {
  [key: string]: TNestedFoundationToken | string | number | number[];
}

export type TFoundationToken = TNestedFoundationToken | string | number | number[];

export type TTypographyToken = {
  Font: string;
  LetterSpacing: number;
  FontFamily: string;
  FontWeight: string;
  FontSize: number;
  LineHeight: number;
};

export type TUDim2 = {
  xScale: number;
  xOffset: number;
  yScale: number;
  yOffset: number;
};

export enum TAutomaticSize {
  None = 'None',
  X = 'X',
  Y = 'Y',
  XY = 'XY'
}
