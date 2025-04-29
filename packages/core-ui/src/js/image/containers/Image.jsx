import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import FIT_STYLES from "../constants/fitStyles";

// TODO: old, migrated code
// eslint-disable-next-line react/display-name
const Image = React.forwardRef(({ className, src, alt, fitStyle, ...otherProps }, ref) => {
  // Handle under-sized image for object-fit: contain polyfill
  const wrapperRef = useRef(null);
  const [imageScaleClass, setImageScaleClass] = useState(null);

  const wrapperCssClass = classNames("image-wrapper", fitStyle);
  const imageCssClass = classNames("image", imageScaleClass, className);

  // Handle under-sized image for object-fit: contain polyfill
  useEffect(() => {
    // Start from fresh
    setImageScaleClass(null);

    if (fitStyle === FIT_STYLES.contain) {
      // Adding window to disambiguate
      const image = new window.Image();
      image.onload = () => {
        const { naturalHeight, naturalWidth } = image;

        if (wrapperRef.current) {
          const { clientHeight, clientWidth } = wrapperRef.current;

          if (naturalHeight < clientHeight && naturalWidth < clientWidth) {
            const scaleCssClass = naturalHeight > naturalWidth ? "scale-height" : "scale-width";
            setImageScaleClass(scaleCssClass);
          }
        }
      };
      image.src = src;
    }
  }, [src, fitStyle]);

  // Need an layer of wrapper to "polyfill" object-fit for IE11
  return (
    <div ref={wrapperRef} className={wrapperCssClass}>
      <img {...otherProps} ref={ref} className={imageCssClass} src={src} alt={alt} />
    </div>
  );
});

Image.defaultProps = {
  className: null,
  fitStyle: FIT_STYLES.fill,
};

Image.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  fitStyle: PropTypes.oneOf(Object.values(FIT_STYLES)),
};

Image.fitStyles = FIT_STYLES;

export default Image;
