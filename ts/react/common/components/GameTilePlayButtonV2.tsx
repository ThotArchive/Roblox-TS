import React, { useEffect, useState } from 'react';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import { Loading } from 'react-style-guide';
import experimentConstants from '../constants/experimentConstants';
import bedev2Services from '../services/bedev2Services';

export const GameTilePlayButtonV2 = ({
  universeId,
  placeId,
  playButtonEventProperties,
  disableLoadingState
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  disableLoadingState?: boolean;
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

  useEffect(() => {
    bedev2Services
      .getExperimentationValues(layerNames.playButton, defaultValues.playButton)
      .then(data => {
        setHasUpdatedPlayButtonsIxp(data.HasUpdatedPlayButtons === true);
      })
      .catch(() => {
        setHasUpdatedPlayButtonsIxp(defaultValues.playButton.HasUpdatedPlayButtons);
      });
  }, [layerNames.playButton, defaultValues.playButton]);

  if (hasUpdatedPlayButtonsIxp === undefined) {
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
  if (!hasUpdatedPlayButtonsIxp && shouldShowUnplayableButton(playabilityStatus)) {
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
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false
};

export default GameTilePlayButtonV2;
