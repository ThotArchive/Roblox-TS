import { TValidHttpUrl } from 'core-utilities';
import React, { useMemo } from 'react';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import { ValueOf } from '../utils/typeUtils';

export const GameTilePlayButtonV2 = ({
  universeId,
  placeId,
  playButtonEventProperties,
  disableLoadingState,
  redirectPurchaseUrl
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  disableLoadingState?: boolean;
  redirectPurchaseUrl?: TValidHttpUrl;
}): JSX.Element => {
  const { usePlayabilityStatus, PlayabilityStatuses, DefaultPlayButton } = RobloxPlayButton;
  const [playabilityStatus, refetchPlayabilityStatus] = usePlayabilityStatus(universeId);

  const isPurchaseRequired = useMemo((): boolean => {
    if (!playabilityStatus) {
      return false;
    }
    const allowedList = [
      PlayabilityStatuses.PurchaseRequired,
      PlayabilityStatuses.FiatPurchaseRequired
    ] as ValueOf<typeof PlayabilityStatuses>[];

    return allowedList.includes(playabilityStatus);
  }, [playabilityStatus, PlayabilityStatuses]);

  return (
    <DefaultPlayButton
      placeId={placeId}
      universeId={universeId}
      refetchPlayabilityStatus={refetchPlayabilityStatus}
      playabilityStatus={playabilityStatus}
      eventProperties={playButtonEventProperties}
      disableLoadingState={disableLoadingState}
      buttonClassName={
        isPurchaseRequired ? 'btn-economy-robux-white-lg purchase-button' : undefined
      }
      hideButtonText={!isPurchaseRequired}
      redirectPurchaseUrl={isPurchaseRequired ? redirectPurchaseUrl : undefined}
      showDefaultPurchaseText={playabilityStatus === PlayabilityStatuses.FiatPurchaseRequired}
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false,
  redirectPurchaseUrl: undefined
};

export default GameTilePlayButtonV2;
