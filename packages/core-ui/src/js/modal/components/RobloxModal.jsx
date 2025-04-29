import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";
import ModalDialog from "react-bootstrap/lib/ModalDialog";
import ModalTitle from "react-bootstrap/lib/ModalTitle";
import ModalBody from "./RobloxModalBody";
import ModalFooter from "./RobloxModalFooter";
import ModalHeader from "./RobloxModalHeader";

// There is a lot more props that we can utilize in the implementation
// I only list those common ones here so we can do type checking
// We can discuss to define the props we want to support as the API
function RobloxModal({ show, size, onHide, children, ...otherProps }) {
  return (
    <Modal {...otherProps} show={show} bsSize={size} onHide={onHide}>
      {children}
    </Modal>
  );
}

RobloxModal.defaultProps = {
  show: false,
  size: null,
  onHide: null,
  children: null,
};

RobloxModal.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  onHide: PropTypes.func,
  children: PropTypes.node,
};

RobloxModal.Title = ModalTitle;
RobloxModal.Header = ModalHeader;
RobloxModal.Body = ModalBody;
RobloxModal.Footer = ModalFooter;
RobloxModal.Dialog = ModalDialog;

export default RobloxModal;
