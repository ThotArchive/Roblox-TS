import React, { useState, useEffect } from 'react';
import { Link } from 'react-style-guide';
import classNames from 'classnames';
import { TGetPlaceDetails } from '../types/bedev1Types';
import bedev1Services from '../services/bedev1Services';
import { PlayButtonLoadingShimmer } from './GameTilePlayButton';

const HoverTilePurchaseButton = ({
  placeId,
  clientReferralUrl,
  buttonClassName,
  purchaseIconClassName
}: {
  placeId: string;
  clientReferralUrl?: string;
  buttonClassName: string;
  purchaseIconClassName: string;
}): JSX.Element => {
  const [placeDetails, setPlaceDetails] = useState<TGetPlaceDetails | undefined>(undefined);
  const [error, setError] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchPlaceDetails = () => {
      bedev1Services
        .getPlaceDetails(placeId)
        .then(response => setPlaceDetails(response))
        .catch(() => {
          setError(true);
        });
    };

    fetchPlaceDetails();
  }, [placeId]);

  if (placeDetails === undefined && !error) {
    return <PlayButtonLoadingShimmer />;
  }

  const linkClassName = classNames(buttonClassName, 'btn-full-width');

  return (
    <React.Fragment>
      <Link
        data-testid='hover-tile-purchase-button'
        className={linkClassName}
        url={clientReferralUrl || placeDetails?.url}>
        <span className={purchaseIconClassName} />
        <span className='btn-text'>{placeDetails?.price || '--'}</span>{' '}
      </Link>
    </React.Fragment>
  );
};

HoverTilePurchaseButton.defaultProps = {
  clientReferralUrl: ''
};

export default HoverTilePurchaseButton;
