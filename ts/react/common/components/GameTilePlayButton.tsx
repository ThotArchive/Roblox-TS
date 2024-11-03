import React from 'react';
import { PlayButton as RobloxPlayButton } from 'Roblox';
import classNames from 'classnames';
import HoverTilePurchaseButton from './HoverTilePurchaseButton';

export const PlayButtonLoadingShimmer = (): JSX.Element => {
  return (
    <div
      className='shimmer play-button game-card-thumb-container'
      data-testid='play-button-default'
    />
  );
};

export const GameTilePlayButton = ({
  universeId,
  placeId,
  playButtonEventProperties,
  buttonClassName,
  purchaseIconClassName,
  clientReferralUrl,
  shouldPurchaseNavigateToDetails
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  buttonClassName?: string;
  purchaseIconClassName?: string;
  clientReferralUrl?: string;
  shouldPurchaseNavigateToDetails?: boolean;
}): JSX.Element => {
  const {
    usePlayabilityStatus,
    PlayabilityStatuses,
    PlayButton: PlayButtonComponent,
    PurchaseButton
  } = RobloxPlayButton;

  const [playabilityStatus, refetchPlayabilityStatus] = usePlayabilityStatus(universeId);

  switch (playabilityStatus) {
    case undefined:
    case PlayabilityStatuses.GuestProhibited:
    case PlayabilityStatuses.Playable:
      return (
        <PlayButtonComponent
          universeId={universeId}
          placeId={placeId}
          status={playabilityStatus ?? PlayabilityStatuses.Playable}
          eventProperties={playButtonEventProperties}
          buttonClassName={
            buttonClassName ? classNames(buttonClassName, 'regular-play-button') : undefined
          }
          disableLoadingState
        />
      );
    case PlayabilityStatuses.PurchaseRequired:
      if (shouldPurchaseNavigateToDetails) {
        // Navigates to Game Details page for user to purchase
        return (
          <HoverTilePurchaseButton
            placeId={placeId}
            clientReferralUrl={clientReferralUrl}
            purchaseIconClassName={purchaseIconClassName ?? 'icon-common-play'}
            buttonClassName={classNames(
              buttonClassName ?? 'btn-growth-lg play-button',
              'purchase-button'
            )}
          />
        );
      }
      return (
        <PurchaseButton
          universeId={universeId}
          placeId={placeId}
          iconClassName={purchaseIconClassName ?? 'icon-common-play'}
          refetchPlayabilityStatus={refetchPlayabilityStatus}
          buttonClassName={buttonClassName}
        />
      );
    case PlayabilityStatuses.UniverseRootPlaceIsPrivate:
      return (
        <div className={buttonClassName ?? 'btn-growth-lg play-button'}>
          <span className='icon-status-private' />
        </div>
      );
    default:
      return (
        <div className={buttonClassName ?? 'btn-growth-lg play-button'}>
          <span className='icon-status-unavailable' />
        </div>
      );
  }
};

GameTilePlayButton.defaultProps = {
  playButtonEventProperties: {},
  buttonClassName: undefined,
  purchaseIconClassName: undefined,
  clientReferralUrl: undefined,
  shouldPurchaseNavigateToDetails: false
};

export default GameTilePlayButton;
