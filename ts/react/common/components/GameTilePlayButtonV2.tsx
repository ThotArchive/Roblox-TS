import { TValidHttpUrl } from 'core-utilities';
import React, { useEffect, useState } from 'react';
import { Loading } from 'react-style-guide';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import experimentConstants from '../constants/experimentConstants';
import useShouldShowVpcPlayButtonUpsells from '../hooks/useShouldShowVpcPlayButtonUpsells';
import bedev2Services from '../services/bedev2Services';

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

  const { shouldShowVpcPlayButtonUpsells, isFetchingPolicy } = useShouldShowVpcPlayButtonUpsells();

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
        playabilityStatus === PlayabilityStatuses.PurchaseRequired
          ? 'btn-common-play-game-lg purchase-button'
          : undefined
      }
      hideButtonText={playabilityStatus !== PlayabilityStatuses.PurchaseRequired}
      hasUpdatedPlayButtonsIxp={hasUpdatedPlayButtonsIxp}
      hasUpdatedPlayButtonsVpcIxp={hasUpdatedPlayButtonsVpcIxp}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
      redirectPurchaseUrl={
        playabilityStatus === PlayabilityStatuses.PurchaseRequired ? redirectPurchaseUrl : undefined
      }
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false,
  redirectPurchaseUrl: undefined
};

export default GameTilePlayButtonV2;
