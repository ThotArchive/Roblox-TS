import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ButtonBase from './ButtonBase';
import { DEFAULT_VARIANTS, SIZE_VARIANTS, WIDTH_VARIANTS } from '../constants/variants';

const allVariants = Object.values(DEFAULT_VARIANTS);
const allSizes = Object.values(SIZE_VARIANTS);
const allWidths = Object.values(WIDTH_VARIANTS);

const getCssClass = (variant, size) => {
  if (allVariants.includes(variant) && allSizes.includes(size)) {
    return `btn-${variant}-${size}`;
  }
  return null;
};

const getWidthCssClass = width => {
  if (allWidths.includes(width)) {
    return `btn-${width}-width`;
  }
  return null;
};

function Button({
  className,
  variant,
  size,
  width,
  isDisabled,
  isLoading,
  children,
  ...otherProps
}) {
  const cssClassName = classNames(className, getCssClass(variant, size), getWidthCssClass(width));
  return (
    // TODO: Add loading logic once have the design
    <ButtonBase {...otherProps} className={cssClassName} disabled={isDisabled || isLoading}>
      {children}
    </ButtonBase>
  );
}

Button.defaultProps = {
  className: null,
  variant: DEFAULT_VARIANTS.primary,
  size: SIZE_VARIANTS.medium,
  width: WIDTH_VARIANTS.min,
  isDisabled: false,
  isLoading: false,
  children: null
};

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(allVariants),
  size: PropTypes.oneOf(allSizes),
  width: PropTypes.oneOf(allWidths),
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  children: PropTypes.node
};

Button.variants = DEFAULT_VARIANTS;
Button.sizes = SIZE_VARIANTS;
Button.widths = WIDTH_VARIANTS;

export default Button;
