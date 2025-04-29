import PropTypes from "prop-types";
import { Footer } from "react-bootstrap/lib/Modal";

function RobloxModalFooter({ children, ...otherProps }) {
  return <Footer {...otherProps}>{children}</Footer>;
}

RobloxModalFooter.defaultProps = {
  children: null,
};

RobloxModalFooter.propTypes = {
  children: PropTypes.node,
};

export default RobloxModalFooter;
