import PropTypes from "prop-types";
import classNames from "classnames";
import ButtonBase from "./ButtonBase";
import { ICON_TYPES, SIZE_VARIANTS } from "../constants/variants";

const allTypes = Object.values(ICON_TYPES);
const allSizes = Object.values(SIZE_VARIANTS);

const getCssClass = (iconType, iconName, size) => {
  if (allSizes.includes(size)) {
    return `btn-${iconType}-${iconName}-${size}`;
  }
  return null;
};

function IconButton({
  className,
  iconType,
  iconName,
  size,
  isDisabled,
  isLoading,
  altName,
  ...otherProps
}) {
  const cssClassName = classNames(className, getCssClass(iconType, iconName, size));
  return (
    <ButtonBase
      {...otherProps}
      className={cssClassName}
      disabled={isDisabled || isLoading}
      title={altName || iconName.replace(/-/g, " ")}
    >
      <span className={`icon-${iconName}`} />
    </ButtonBase>
  );
}

IconButton.defaultProps = {
  className: null,
  iconType: ICON_TYPES.generic,
  size: SIZE_VARIANTS.medium,
  isDisabled: false,
  isLoading: false,
  altName: "",
};

IconButton.propTypes = {
  className: PropTypes.string,
  iconType: PropTypes.oneOf(allTypes),
  iconName: PropTypes.string.isRequired,
  size: PropTypes.oneOf(allSizes),
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  altName: PropTypes.string,
};

IconButton.iconTypes = ICON_TYPES;
IconButton.sizes = SIZE_VARIANTS;

export default IconButton;
