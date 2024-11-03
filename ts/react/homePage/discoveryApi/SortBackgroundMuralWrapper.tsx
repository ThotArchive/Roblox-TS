import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { getThumbnailForAsset } from '../../common/services/bedev2Services';

type Props = { backgroundImageAssetId?: number };

const SortBackgroundMuralWrapper: React.FC<Props> = ({ children, backgroundImageAssetId }) => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

  useEffect(() => {
    let fetching = true;
    if (backgroundImageAssetId) {
      getThumbnailForAsset(backgroundImageAssetId).then(
        (assetUrl: string) => {
          if (fetching) {
            setBackgroundImageUrl(assetUrl);
          }
        },
        () => {
          if (fetching) {
            setBackgroundImageUrl('');
          }
        }
      );
    } else {
      setBackgroundImageUrl('');
    }
    return () => {
      fetching = false;
    };
  }, [backgroundImageAssetId]);

  return (
    <div
      className={classNames([
        'game-sort-carousel-wrapper',
        {
          'game-sort-with-mural': !!backgroundImageAssetId,
          'game-sort-mural-loaded': !!backgroundImageUrl
        }
      ])}>
      {backgroundImageUrl && (
        <div className='game-sort-mural-wrapper'>
          <img className='game-sort-mural' alt='' src={backgroundImageUrl} />
          <div className='game-sort-mural-gradient' />
        </div>
      )}
      {children}
    </div>
  );
};

export default SortBackgroundMuralWrapper;
