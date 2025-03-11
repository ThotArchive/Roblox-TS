import { parseMaybeStringNumberField, parseStringField } from '../utils/analyticsParsingUtils';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { SduiRegisteredComponents } from './SduiComponentRegistry';
import { TAnalyticsData, TCollectionAnalyticsData, TItemAnalyticsData } from './SduiTypes';

export const DUMMY_ITEM_DATA: TItemAnalyticsData = {
  id: 'Unknown',
  itemPosition: -1
};

export const DUMMY_COLLECTION_DATA: TCollectionAnalyticsData = {
  collectionId: -1,
  contentType: 'Unknown',
  itemsPerRow: -1,
  collectionPosition: -1,
  totalNumberOfItems: -1
};

export const isValidCollectionAnalyticsData = (data: TCollectionAnalyticsData): boolean => {
  if (
    data.collectionId === undefined ||
    data.collectionId < 0 ||
    data.contentType === undefined ||
    data.itemsPerRow === undefined ||
    data.itemsPerRow < 0 ||
    data.collectionPosition === undefined ||
    data.collectionPosition < 0 ||
    data.totalNumberOfItems === undefined ||
    data.totalNumberOfItems < 0
  ) {
    return false;
  }

  return true;
};

export const buildAndValidateCollectionAnalyticsData = (
  ancestorAnalyticsData: TAnalyticsData,
  analyticsData: TAnalyticsData,
  componentType: keyof typeof SduiRegisteredComponents,
  itemsPerRow: number,
  totalNumberOfItems: number
): TCollectionAnalyticsData => {
  const collectionAnalyticsData = {
    ...ancestorAnalyticsData,
    ...analyticsData
  };

  const resultCollectionAnalyticsData = {
    ...collectionAnalyticsData,
    collectionId: parseMaybeStringNumberField(
      collectionAnalyticsData.collectionId,
      DUMMY_COLLECTION_DATA.collectionId
    ),
    collectionPosition: parseMaybeStringNumberField(collectionAnalyticsData.collectionPosition, -1),
    contentType: parseStringField(
      collectionAnalyticsData.contentType,
      DUMMY_COLLECTION_DATA.contentType
    ),
    itemsPerRow,
    totalNumberOfItems
  };

  if (!isValidCollectionAnalyticsData(resultCollectionAnalyticsData)) {
    logSduiError(
      SduiErrorNames.AnalyticsBuilderInvalidCollectionAnalyticsData,
      `Collection analytics data for component type ${componentType} is invalid: ${JSON.stringify(
        resultCollectionAnalyticsData
      )}`
    );

    // Fill in any missing fields with dummy data
    return {
      ...DUMMY_COLLECTION_DATA,
      ...resultCollectionAnalyticsData
    };
  }

  return resultCollectionAnalyticsData;
};

export const isValidItemAnalyticsData = (data: TItemAnalyticsData): boolean => {
  if (data.id === undefined || data.itemPosition === undefined || data.itemPosition < 0) {
    return false;
  }

  return true;
};

export const buildAndValidateItemAnalyticsData = (
  analyticsData: TAnalyticsData,
  parentAnalyticsData: TAnalyticsData,
  localAnalyticsData: TAnalyticsData | undefined
): TItemAnalyticsData => {
  const itemAnalyticsData = {
    ...parentAnalyticsData,
    ...analyticsData,
    ...localAnalyticsData
  };

  const resultItemAnalyticsData: TItemAnalyticsData = {
    ...itemAnalyticsData,
    id: parseStringField(itemAnalyticsData.id, DUMMY_ITEM_DATA.id),
    itemPosition: parseMaybeStringNumberField(
      itemAnalyticsData.itemPosition,
      DUMMY_ITEM_DATA.itemPosition
    )
  };

  if (!isValidItemAnalyticsData(resultItemAnalyticsData)) {
    logSduiError(
      SduiErrorNames.AnalyticsBuilderInvalidItemAnalyticsData,
      `Item analytics data is invalid: ${JSON.stringify(resultItemAnalyticsData)}`
    );

    // Fill in any missing fields with dummy data
    return {
      ...DUMMY_ITEM_DATA,
      ...resultItemAnalyticsData
    };
  }

  return resultItemAnalyticsData;
};
