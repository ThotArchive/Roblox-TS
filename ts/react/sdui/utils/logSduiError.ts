import { fireEvent } from 'roblox-event-tracker';
import { eventStreamService } from 'core-roblox-utilities';
import { EventContext, parseEventParams } from '@rbx/unified-logging';

const EVENT_NAME = 'webDiscoverySduiError';

export enum SduiErrorNames {
  AnalyticsBuilderInvalidCollectionAnalyticsData = 'AnalyticsBuilderInvalidCollectionAnalyticsData',
  AnalyticsBuilderInvalidItemAnalyticsData = 'AnalyticsBuilderInvalidItemAnalyticsData',
  AnalyticsParsingDiscardedInvalidParam = 'AnalyticsParsingDiscardedInvalidParam',
  AssetImageMissingAssetUrl = 'AssetImageMissingAssetUrl',
  BuildBaseActionParamsMissingItem = 'BuildBaseActionParamsMissingItem',
  BuildBaseImpressionParamsMissingItem = 'BuildBaseImpressionParamsMissingItem',
  BuildItemImpressionParamsMissingItem = 'BuildItemImpressionParamsMissingItem',
  ComponentNotFound = 'ComponentNotFound',
  ExecuteActionInvalidActionType = 'ExecuteActionInvalidActionType',
  InvalidImageQualityLevelConditionValue = 'InvalidImageQualityLevelConditionValue',
  InvalidMaxWidthConditionValue = 'InvalidMaxWidthConditionValue',
  InvalidPageForSessionAnalytics = 'InvalidPageForSessionAnalytics',
  InvalidParsedMaxWidthConditionValue = 'InvalidParsedMaxWidthConditionValue',
  ParseBooleanFieldInvalidNumber = 'ParseBooleanFieldInvalidNumber',
  ParseBooleanFieldInvalidString = 'ParseBooleanFieldInvalidString',
  ParseBooleanFieldInvalidType = 'ParseBooleanFieldInvalidType',
  PropParseFailure = 'PropParseFailure',
  PropParserNotFound = 'PropParserNotFound',
  ReportItemActionMissingCollectionData = 'ReportItemActionMissingCollectionData',
  ReportItemImpressionsMissingData = 'ReportItemImpressionsMissingData',
  ReportItemImpressionsNoIndexesToSend = 'ReportItemImpressionsNoIndexesToSend',
  SduiActionOpenGameDetailsInvalidId = 'SduiActionOpenGameDetailsInvalidId',
  SduiComponentBuildPropsAndChildrenInvalidConfig = 'SduiComponentBuildPropsAndChildrenInvalidConfig',
  SduiFeedItemBoundaryError = 'SduiFeedItemBoundaryError',
  SduiParseAssetUrlInvalidFormat = 'SduiParseAssetUrlInvalidFormat',
  SduiParseAssetUrlInvalidInput = 'SduiParseAssetUrlInvalidInput',
  SduiParseAssetUrlIntoComponentInvalidAssetType = 'SduiParseAssetUrlIntoComponentInvalidAssetType',
  SduiParseAssetUrlIntoComponentInvalidRbxThumb = 'SduiParseAssetUrlIntoComponentInvalidRbxThumb',
  SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType = 'SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType',
  SduiParseCallbackInvalidConfig = 'SduiParseCallbackInvalidConfig',
  SduiParseUiComponentInvalidConfig = 'SduiParseUiComponentInvalidConfig',
  SduiParseGradientInvalidConfig = 'SduiParseGradientInvalidConfig',
  ServerDrivenFeedItemMissingFeedOrFeedItems = 'ServerDrivenFeedItemMissingFeedOrFeedItems',
  ServerDrivenFeedItemMissingItem = 'ServerDrivenFeedItemMissingItem',
  SingleItemCollectionItemImpressedButMissing = 'SingleItemCollectionItemImpressedButMissing',
  SingleItemCollectionMissingItem = 'SingleItemCollectionMissingItem',
  UnknownImageQualityLevelConditionValue = 'UnknownImageQualityLevelConditionValue',
  UnknownResponsivePropConditionKey = 'UnknownResponsivePropConditionKey',
  VerticalFeedMissingFeedItems = 'VerticalFeedMissingFeedItems'
}

/**
 * Logs an error with the SDUI system to both the real-time tracker (simple key)
 * and the event stream (more detailed information, but delayed).
 */
export const logSduiError = (errorName: string, errorMessage: string): void => {
  fireEvent(errorName);

  const params = {
    errorName,
    errorMessage
  };

  eventStreamService.sendEvent(
    {
      name: EVENT_NAME,
      type: EVENT_NAME,
      // TODO https://roblox.atlassian.net/browse/CLIGROW-2205: context should come from sduiContext.pageContext
      context: EventContext.Home
    },
    parseEventParams(params)
  );
};

export default logSduiError;
