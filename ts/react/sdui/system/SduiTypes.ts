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

// Expected props to be shared by all components after prop parsing
export interface TSduiCommonProps {
  componentConfig: TServerDrivenComponentConfig;

  analyticsContext: TAnalyticsContext;
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
