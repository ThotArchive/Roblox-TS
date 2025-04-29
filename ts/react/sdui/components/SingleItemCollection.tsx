import React, { useCallback, useMemo, useRef } from 'react';
import { eventStreamService } from 'core-roblox-utilities';
import { SessionInfo, useCollectionItemsIntersectionTracker } from '@rbx/unified-logging';
import SduiComponent from '../system/SduiComponent';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import {
  TAnalyticsContext,
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiCommonProps,
  TServerDrivenComponentConfig
} from '../system/SduiTypes';
import {
  buildAndValidateItemAnalyticsData,
  buildAndValidateCollectionAnalyticsData
} from '../system/buildAnalyticsData';
import reportImpressionAnalytics from '../system/reportImpressionAnalytics';
import { TSduiActionConfig } from '../system/SduiActionHandlerRegistry';
import reportActionAnalytics from '../system/reportActionAnalytics';
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
  TCarouselGameImpressions
} from '../../common/constants/eventStreamConstants';
import { PageContext } from '../../common/types/pageContext';
import {
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField
} from '../utils/analyticsParsingUtils';

type TSingleItemCollectionProps = {
  item: TServerDrivenComponentConfig | undefined;
  children?: React.ReactNode;
} & TSduiCommonProps;

/**
 * Renders a collection with a single item using Server Driven UI
 * Also supports rendering arbitrary children below the item
 */
const SingleItemCollection = ({
  componentConfig,
  analyticsContext,
  item,
  children
}: TSingleItemCollectionProps): JSX.Element => {
  const collectionAnalyticsDataRef = useRef<TCollectionAnalyticsData | null>(null);

  const itemAnalyticsDataRef = useRef<TItemAnalyticsData | null>(null);

  // Called while executing actions through parseCallback
  const logAction = useCallback(
    (actionConfig: TSduiActionConfig, actionAnalyticsContext: TAnalyticsContext) => {
      reportActionAnalytics(
        actionConfig,
        actionAnalyticsContext,
        collectionAnalyticsDataRef.current
      );
    },
    [collectionAnalyticsDataRef]
  );

  const getCollectionAnalyticsData = useCallback(() => {
    return collectionAnalyticsDataRef.current;
  }, [collectionAnalyticsDataRef]);

  // Create an updated context that includes logAction and getCollectionData
  const collectionAnalyticsContext = useMemo(() => {
    return {
      ...analyticsContext,
      logAction,
      getCollectionAnalyticsData
    };
  }, [analyticsContext, logAction, getCollectionAnalyticsData]);

  collectionAnalyticsDataRef.current = useMemo<TCollectionAnalyticsData>(() => {
    const itemsPerRow = 1;
    const totalNumberOfItems = 1;

    return buildAndValidateCollectionAnalyticsData(
      collectionAnalyticsContext.ancestorAnalyticsData ?? {},
      collectionAnalyticsContext.analyticsData ?? {},
      componentConfig.componentType,
      itemsPerRow,
      totalNumberOfItems
    );
  }, [
    collectionAnalyticsContext.ancestorAnalyticsData,
    collectionAnalyticsContext.analyticsData,
    componentConfig.componentType
  ]);

  const onItemImpressed = useCallback(
    (indexesToSend: number[]) => {
      if (!item) {
        logSduiError(
          SduiErrorNames.SingleItemCollectionItemImpressedButMissing,
          `SingleItemCollection onItemImpressed missing item ${JSON.stringify(
            item
          )} with config ${JSON.stringify(componentConfig)}`
        );
        return;
      }

      // Fire gameImpressions for Hero Units of type Game during telemetry migration
      if (collectionAnalyticsDataRef.current) {
        const { contentType } = collectionAnalyticsDataRef.current;
        if (contentType === 'Game' || contentType === 'HeroUnit') {
          if (itemAnalyticsDataRef.current?.universeId) {
            const gameImpressionsParams: TCarouselGameImpressions = {
              [EventStreamMetadata.RootPlaceIds]: [
                parseMaybeStringNumberField(itemAnalyticsDataRef.current?.placeId, -1)
              ],
              [EventStreamMetadata.UniverseIds]: [
                parseMaybeStringNumberField(itemAnalyticsDataRef.current?.universeId, -1)
              ],
              [EventStreamMetadata.AdsPositions]: [
                parseBooleanField(itemAnalyticsDataRef.current?.adFlag, false) === true ? 1 : 0
              ],
              [EventStreamMetadata.AdFlags]: [
                parseBooleanField(itemAnalyticsDataRef.current?.adFlag, false) === true ? 1 : 0
              ],
              [EventStreamMetadata.AbsPositions]: [0],
              [EventStreamMetadata.SortPos]:
                collectionAnalyticsDataRef.current?.collectionPosition ?? -1,
              [EventStreamMetadata.GameSetTypeId]: collectionAnalyticsDataRef.current?.collectionId,
              // TODO https://roblox.atlassian.net/browse/CLIGROW-2205
              // context should come from sduiContext.pageContext
              [EventStreamMetadata.Page]: PageContext.HomePage,
              [EventStreamMetadata.ComponentType]: 'HeroUnit',
              [SessionInfoType.HomePageSessionInfo]: parseStringField(
                collectionAnalyticsDataRef.current?.[SessionInfo.HomePageSessionInfo],
                ''
              )
            };

            const eventStreamParams = eventStreamConstants.gameImpressions(gameImpressionsParams);
            eventStreamService.sendEvent(...eventStreamParams);
          }
        }
      }

      reportImpressionAnalytics(
        indexesToSend,
        [itemAnalyticsDataRef.current],
        collectionAnalyticsDataRef.current
      );
    },
    [item, componentConfig, collectionAnalyticsDataRef, itemAnalyticsDataRef]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useCollectionItemsIntersectionTracker(
    containerRef,
    1, // childrenLength
    onItemImpressed
  );

  const itemToRender = useMemo(() => {
    if (!item) {
      logSduiError(
        SduiErrorNames.SingleItemCollectionMissingItem,
        `SingleItemCollection missing item ${JSON.stringify(item)} with config ${JSON.stringify(
          componentConfig
        )}`
      );

      return <React.Fragment />;
    }

    const itemIndex = 0;
    const localAnalyticsData = {
      itemPosition: itemIndex
    };

    // Store in ref for use when logging impressions
    itemAnalyticsDataRef.current = buildAndValidateItemAnalyticsData(
      item.analyticsData ?? {},
      collectionAnalyticsDataRef.current ?? {},
      localAnalyticsData
    );

    return (
      <SduiComponent
        componentConfig={item}
        parentAnalyticsContext={collectionAnalyticsContext}
        localAnalyticsData={localAnalyticsData}
      />
    );
  }, [item, componentConfig, collectionAnalyticsContext, collectionAnalyticsDataRef]);

  // Attach updated context with logAction and getCollectionData to arbitrary children
  const childrenWithAnalyticsContext = useMemo(() => {
    return React.Children.map(children, (child: React.ReactNode, index: number) => {
      if (!React.isValidElement(child)) {
        logSduiError(
          'SingleItemCollectionChildNotReactElement',
          `SingleItemCollectionChildNotReactElement ${JSON.stringify(
            componentConfig
          )} child ${JSON.stringify(child)} is not a valid React element`
        );
        return child;
      }

      const id = `${componentConfig.componentType}-child-${index}`;

      return React.cloneElement(child, {
        ...child.props,
        key: id,
        parentAnalyticsContext: collectionAnalyticsContext
      });
    });
  }, [children, collectionAnalyticsContext, componentConfig]);

  return (
    <div ref={containerRef}>
      {itemToRender}
      {childrenWithAnalyticsContext}
    </div>
  );
};

export default SingleItemCollection;
