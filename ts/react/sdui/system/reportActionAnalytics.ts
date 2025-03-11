import {
  EventContext,
  EventNames,
  ItemActionMetadata,
  parseEventParams,
  SharedEventMetadata
} from '@rbx/unified-logging';
import { eventStreamService } from 'core-roblox-utilities';
import { TAnalyticsContext, TCollectionAnalyticsData, TItemAnalyticsData } from './SduiTypes';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { buildAndValidateItemAnalyticsData, DUMMY_COLLECTION_DATA } from './buildAnalyticsData';
import { TSduiActionConfig } from './SduiActionHandlerRegistry';
import { filterInvalidEventParams } from '../utils/analyticsParsingUtils';

export const buildBaseActionParams = (
  item: TItemAnalyticsData,
  entryIndex: number,
  contentType: string,
  collectionPosition: number,
  collectionId: number,
  totalNumberOfItems: number,
  actionType: string
): Record<string, string | number | boolean> => {
  if (!item) {
    logSduiError(
      SduiErrorNames.BuildBaseActionParamsMissingItem,
      `Item is nil when sending action for collection ${collectionId}`
    );

    return {};
  }

  return {
    [SharedEventMetadata.CollectionId]: collectionId,
    [SharedEventMetadata.CollectionPosition]: collectionPosition,
    [SharedEventMetadata.ContentType]: contentType,
    [ItemActionMetadata.TotalNumberOfItems]: totalNumberOfItems,
    [ItemActionMetadata.ItemId]: item.id,
    // incremented to match app
    [ItemActionMetadata.ItemPosition]: entryIndex + 1,
    [ItemActionMetadata.PositionInTopic]: entryIndex + 1,
    // TODO https://roblox.atlassian.net/browse/CLIGROW-2235
    // Add and consume [ItemActionMetadata.ActionType] from @rbx/unified-logging
    actionType
  };
};

export const reportActionAnalytics = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  collectionAnalyticsData: TCollectionAnalyticsData | null
): void => {
  const itemAnalyticsData = buildAndValidateItemAnalyticsData(
    analyticsContext.analyticsData ?? {},
    analyticsContext.ancestorAnalyticsData ?? {},
    undefined
  );

  const resultCollectionAnalyticsData =
    collectionAnalyticsData ??
    (analyticsContext.getCollectionData && analyticsContext.getCollectionData()) ??
    null;

  if (!resultCollectionAnalyticsData) {
    logSduiError(
      SduiErrorNames.ReportItemActionMissingCollectionData,
      `Collection data is missing when sending action ${JSON.stringify(actionConfig)}`
    );
  }

  const finalCollectionAnalyticsData = resultCollectionAnalyticsData ?? DUMMY_COLLECTION_DATA;

  const baseParams = buildBaseActionParams(
    itemAnalyticsData,
    itemAnalyticsData.itemPosition,
    finalCollectionAnalyticsData.contentType,
    finalCollectionAnalyticsData.collectionPosition,
    finalCollectionAnalyticsData.collectionId,
    finalCollectionAnalyticsData.totalNumberOfItems,
    actionConfig.actionType
  );

  const params = {
    ...itemAnalyticsData,
    ...finalCollectionAnalyticsData,
    ...filterInvalidEventParams(actionConfig.actionParams),
    ...baseParams
  };

  eventStreamService.sendEvent(
    {
      name: EventNames.ItemAction,
      type: EventNames.ItemAction,
      // TODO https://roblox.atlassian.net/browse/CLIGROW-2205
      // context should come from sduiContext.pageContext
      context: EventContext.Home
    },
    parseEventParams({ ...params })
  );
};

export default reportActionAnalytics;
