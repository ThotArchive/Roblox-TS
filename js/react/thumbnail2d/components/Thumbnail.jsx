import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

function Thumbnail({
  onLoad,
  errorIconClass,
  thumbnailUrl,
  imgClassName,
  containerClass,
  altName
}) {
  const wrapperClass = ClassNames('thumbnail-2d-container', errorIconClass, containerClass);
  const [thumbnailClass, setThumbnailClass] = useState(ClassNames(imgClassName, 'loading'));

  useEffect(() => {
    if (thumbnailUrl === null) {
      setThumbnailClass(ClassNames(imgClassName, 'loading'));
    }
  }, [thumbnailUrl, imgClassName]);

  const imageLoad = () => {
    onLoad();
    setThumbnailClass(imgClassName);
  };
  return (
    <span className={wrapperClass}>
      {thumbnailUrl && (
        <img
          className={thumbnailClass}
          src={thumbnailUrl}
          alt={altName}
          title={altName}
          onLoad={imageLoad}
        />
      )}
    </span>
  );
}

Thumbnail.defaultProps = {
  errorIconClass: '',
  thumbnailUrl: '',
  imgClassName: '',
  containerClass: '',
  altName: '',
  onLoad: () => {}
};

Thumbnail.propTypes = {
  errorIconClass: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  imgClassName: PropTypes.string,
  containerClass: PropTypes.string,
  altName: PropTypes.string,
  onLoad: PropTypes.func
};

export default Thumbnail;
