import React from 'react';
import SduiComponent from '../system/SduiComponent';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { TSduiCommonProps, TServerDrivenComponentConfig } from '../system/SduiTypes';

type TVerticalFeedProps = {
  feedItems: TServerDrivenComponentConfig[] | undefined;
} & TSduiCommonProps;

/**
 * Renders an array of feed items vertically using Server Driven UI
 */
const VerticalFeed = ({
  componentConfig,
  analyticsContext,
  sduiContext,
  feedItems
}: TVerticalFeedProps): JSX.Element => {
  if (!feedItems) {
    logSduiError(
      SduiErrorNames.VerticalFeedMissingFeedItems,
      `SCI missing feedItems ${JSON.stringify(feedItems)} with config ${JSON.stringify(
        componentConfig
      )}`
    );

    return <React.Fragment />;
  }

  return (
    <div>
      {feedItems.map((feedItemConfig: TServerDrivenComponentConfig, index: number) => {
        return (
          <SduiComponent
            // eslint-disable-next-line react/no-array-index-key
            key={`${feedItemConfig.componentType}--${index}`}
            componentConfig={feedItemConfig}
            parentAnalyticsContext={analyticsContext}
            sduiContext={sduiContext}
          />
        );
      })}
    </div>
  );
};

export default VerticalFeed;
