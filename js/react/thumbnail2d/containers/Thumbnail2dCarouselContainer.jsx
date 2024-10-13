import React, { useState, useEffect } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import thumbnailService from '../../../../ts/2d/services/thumbnail2d';
import Thumbnail from '../components/Thumbnail';

function Thumbnail2dCarouselContainer({
  type,
  targetId,
  size,
  imgClassName,
  containerClass,
  format,
  altName
}) {
  const [thumbnails, setThumbnails] = useState(null);
  const [thumbnailStatus, setImageStatus] = useState(null);
  const [thumbnailUrl, setImageUrl] = useState(null);
  const [shimmerClass, setShimmerClass] = useState('shimmer');
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);

  const getNextThumbnailIndex = index => {
    return index >= thumbnails.length - 1 ? 0 : index + 1;
  };

  const advanceThumbnailIndex = () => {
    const newThumbnailIndex = getNextThumbnailIndex(currentThumbnailIndex);
    setCurrentThumbnailIndex(newThumbnailIndex);
  };

  useEffect(() => {
    let loopInterval;
    if (thumbnails) {
      const currentThumbnail = thumbnails[currentThumbnailIndex];
      setImageStatus(currentThumbnail.state);
      setImageUrl(currentThumbnail.imageUrl);
      setShimmerClass('');
      loopInterval = setInterval(() => advanceThumbnailIndex(), 4000);
    }

    return () => {
      clearInterval(loopInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnails, currentThumbnailIndex]);

  useEffect(() => {
    let isUnmounted = false;

    thumbnailService
      .getThumbnailImage(type, size, format, targetId)
      .then(response => {
        if (!isUnmounted) {
          setThumbnails(response.thumbnails);
        }
      })
      .catch(() => {
        if (!isUnmounted) {
          setShimmerClass('');
        }
      });

    return () => {
      isUnmounted = true;
    };
  }, [type, targetId, size, imgClassName, format]);

  return (
    <Thumbnail
      {...{
        thumbnailUrl,
        errorIconClass: ClassNames(thumbnailService.getCssClass(thumbnailStatus)),
        imgClassName,
        altName,
        containerClass: ClassNames(shimmerClass, containerClass)
      }}
    />
  );
}
Thumbnail2dCarouselContainer.defaultProps = {
  size: '576x324',
  imgClassName: '',
  containerClass: '',
  format: 'webp',
  altName: ''
};

Thumbnail2dCarouselContainer.propTypes = {
  type: PropTypes.string.isRequired,
  targetId: PropTypes.number.isRequired,
  size: PropTypes.string,
  format: PropTypes.string,
  imgClassName: PropTypes.string,
  containerClass: PropTypes.string,
  altName: PropTypes.string
};

export default Thumbnail2dCarouselContainer;
