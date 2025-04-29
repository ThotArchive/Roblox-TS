import React, { useCallback, useMemo } from 'react';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import { EventStreamMetadata, TPlayGameClicked } from '../../common/constants/eventStreamConstants';
import { PageContext } from '../../common/types/pageContext';
import { buildCommonReferralParams } from '../system/actions/openGameDetails';
import { TSduiCommonProps } from '../system/SduiTypes';
import { parseMaybeStringNumberField } from '../utils/analyticsParsingUtils';
import { SduiActionType, TSduiActionConfig } from '../system/SduiActionHandlerRegistry';
import executeAction from '../system/executeAction';

type TSduiPlayButtonProps = {
  universeId: string | number;
  placeId: string | number;

  width?: number;

  // Text to display if the button is playable
  playableText?: string;

  // If true, hide the Play icon if the button is playable
  hidePlayableIcon?: boolean;

  /**
    TODO https://roblox.atlassian.net/browse/CLIGROW-2198:
    Add additional supported props to match App

    openGameDetailsOnPurchaseRequired,
    hideIfUnplayable,
    buttonSize,
    referralSource,
    eventContext
   */
} & TSduiCommonProps;

const SduiPlayButton = ({
  analyticsContext,
  sduiContext,
  universeId,
  placeId,
  width,
  playableText,
  hidePlayableIcon
}: TSduiPlayButtonProps): JSX.Element => {
  const { usePlayabilityStatus, PlayabilityStatuses, PlayButton } = RobloxPlayButton;
  const [playabilityStatus] = usePlayabilityStatus(universeId.toString());

  const reportActionEvent = useCallback(() => {
    const actionConfig: TSduiActionConfig = {
      actionType: SduiActionType.PlayButtonClick,
      actionParams: {}
    };

    // The actual game launch is handled by the PlayButton component
    // This executeAction call is for the action analytics only
    executeAction(actionConfig, analyticsContext, sduiContext);
  }, [analyticsContext, sduiContext]);

  const playButtonEventProperties = useMemo<TPlayGameClicked>(() => {
    const commonReferralParams = buildCommonReferralParams(analyticsContext);

    return {
      ...commonReferralParams,
      [EventStreamMetadata.IsAd]: (
        commonReferralParams[EventStreamMetadata.IsAd] ?? false
      ).toString(),
      [EventStreamMetadata.PlaceId]: parseMaybeStringNumberField(placeId, -1),
      [EventStreamMetadata.UniverseId]: parseMaybeStringNumberField(universeId, -1),
      // TODO https://roblox.atlassian.net/browse/CLIGROW-2205
      // context should come from sduiContext.pageContext
      [EventStreamMetadata.PlayContext]: PageContext.HomePage
    };
  }, [analyticsContext, placeId, universeId]);

  // TODO https://roblox.atlassian.net/browse/CLIGROW-2198
  // Handle unplayable and unplayable loading states
  if (playabilityStatus === undefined || playabilityStatus !== PlayabilityStatuses.Playable) {
    return <React.Fragment />;
  }

  return (
    <div
      className='sdui-play-button-container'
      data-testid='sdui-play-button-container'
      style={
        width
          ? {
              width: `${width}px`
            }
          : {}
      }>
      <PlayButton
        universeId={universeId.toString()}
        placeId={placeId.toString()}
        // TODO https://roblox.atlassian.net/browse/CLIGROW-2198
        // Add play button analytics through action tracking
        eventProperties={playButtonEventProperties}
        status={playabilityStatus}
        disableLoadingState
        buttonText={playableText}
        hideIcon={hidePlayableIcon}
        analyticsCallback={reportActionEvent}
      />
    </div>
  );
};

SduiPlayButton.defaultProps = {
  width: undefined,
  playableText: undefined,
  hidePlayableIcon: undefined
};

export default SduiPlayButton;
