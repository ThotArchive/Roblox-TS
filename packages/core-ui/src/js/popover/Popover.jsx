import { useRef } from "react";
import PropTypes from "prop-types";
import BsPopover from "react-bootstrap/lib/Popover";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

function Popover({
  placement,
  button,
  children,
  id,
  trigger,
  rootClose,
  closeOnClick,
  container,
  containerPadding,
  onExit,
}) {
  const overlayRef = useRef();
  const popover = (
    <BsPopover
      id={id}
      onClick={() => {
        if (closeOnClick) {
          overlayRef.current.hide();
        }
      }}
    >
      {children}
    </BsPopover>
  );
  return (
    <OverlayTrigger
      container={container}
      containerPadding={containerPadding}
      ref={overlayRef}
      trigger={trigger}
      placement={placement}
      overlay={popover}
      rootClose={rootClose}
      onExit={onExit}
    >
      {button}
    </OverlayTrigger>
  );
}

Popover.defaultProps = {
  rootClose: true,
  closeOnClick: true,
  container: undefined,
  containerPadding: 0,
  onExit: undefined,
  button: undefined,
};

Popover.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  button: PropTypes.element,
  id: PropTypes.string.isRequired, // used for accessibility
  placement: PropTypes.string.isRequired,
  trigger: PropTypes.string.isRequired,
  rootClose: PropTypes.bool,
  closeOnClick: PropTypes.bool,
  container: PropTypes.element,
  containerPadding: PropTypes.number,
  onExit: PropTypes.func,
};

export default Popover;
