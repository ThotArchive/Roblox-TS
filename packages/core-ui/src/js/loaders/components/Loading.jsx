import PropTypes from "prop-types";
import classNames from "classnames";
import SIZES from "../constants/sizes";

const allSizes = Object.values(SIZES);

const getCssClass = size => {
  if (allSizes.includes(size)) {
    return `spinner ${size}`;
  }
  return `spinner ${SIZES.default}`;
};

function Loading({ size, className }) {
  const cssClassName = classNames(getCssClass(size), className);
  return <span className={cssClassName} />;
}

Loading.defaultProps = {
  size: SIZES.default,
  className: null,
};

Loading.propTypes = {
  size: PropTypes.oneOf(allSizes),
  className: PropTypes.string,
};

Loading.sizes = SIZES;

export default Loading;
