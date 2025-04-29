import { TValidHttpUrl } from 'core-utilities';
import React, { useEffect, useMemo, useState } from 'react';
import { Loading } from 'react-style-guide';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import experimentConstants from '../constants/experimentConstants';
import useGetAppPolicyData from '../hooks/useGetAppPolicyData';
import bedev2Services from '../services/bedev2Services';
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
  const {
    usePlayabilityStatus,
    shouldShowUnplayableButton,
    PlayabilityStatuses,
    DefaultPlayButton
  } = RobloxPlayButton;
  const [playabilityStatus, refetchPlayabilityStatus] = usePlayabilityStatus(universeId);

  const { layerNames, defaultValues } = experimentConstants;
  const [hasUpdatedPlayButtonsIxp, setHasUpdatedPlayButtonsIxp] = useState<boolean | undefined>(
    undefined
  );
  const [hasUpdatedPlayButtonsVpcIxp, setHasUpdatedPlayButtonsVpcIxp] = useState<
    boolean | undefined
  >(undefined);
  const [isFetchingIxp, setIsFetchingIxp] = useState<boolean>(false);

  const { shouldShowVpcPlayButtonUpsells, isFetchingPolicy } = useGetAppPolicyData();

  useEffect(() => {
    setIsFetchingIxp(true);
    bedev2Services
      .getExperimentationValues(layerNames.playButton, defaultValues.playButton)
      .then(data => {
        setHasUpdatedPlayButtonsIxp(data.HasUpdatedPlayButtons === true);
        setHasUpdatedPlayButtonsVpcIxp(data.HasUpdatedPlayButtonsVpc === true);
      })
      .catch(() => {
        setHasUpdatedPlayButtonsIxp(defaultValues.playButton.HasUpdatedPlayButtons);
        setHasUpdatedPlayButtonsVpcIxp(defaultValues.playButton.HasUpdatedPlayButtonsVpc);
      })
      .finally(() => {
        setIsFetchingIxp(false);
      });
  }, [layerNames.playButton, defaultValues.playButton]);

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

  if (isFetchingIxp || isFetchingPolicy) {
    if (!disableLoadingState) {
      return <Loading />;
    }

    return (
      <DefaultPlayButton
        placeId={placeId}
        universeId={universeId}
        refetchPlayabilityStatus={refetchPlayabilityStatus}
        playabilityStatus={PlayabilityStatuses.Playable}
        eventProperties={playButtonEventProperties}
        hideButtonText
        disableLoadingState={disableLoadingState}
      />
    );
  }

  // remove when cleaning up hasUpdatedPlayButtonsIxp as true
  if (
    !hasUpdatedPlayButtonsIxp &&
    shouldShowUnplayableButton(
      playabilityStatus,
      shouldShowVpcPlayButtonUpsells,
      hasUpdatedPlayButtonsVpcIxp
    )
  ) {
    return (
      <div className='btn-growth-lg play-button'>
        <span className='icon-status-unavailable' />
      </div>
    );
  }

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
      hasUpdatedPlayButtonsIxp={hasUpdatedPlayButtonsIxp}
      hasUpdatedPlayButtonsVpcIxp={hasUpdatedPlayButtonsVpcIxp}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
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
