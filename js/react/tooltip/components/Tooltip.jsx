import React from 'react';
import PropTypes from 'prop-types';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import BsTooltip from 'react-bootstrap/lib/Tooltip';

const Tooltip = ({ placement, content, children, id, containerClassName }) => {
  const tooltip = <BsTooltip id={id}>{content}</BsTooltip>;
  return (
    <span className={containerClassName}>
      <OverlayTrigger placement={placement} overlay={tooltip}>
        {children}
      </OverlayTrigger>
    </span>
  );
};

Tooltip.defaultProps = {
  containerClassName: 'tooltip-container'
};

Tooltip.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  id: PropTypes.string.isRequired, // used for accessibility
  placement: PropTypes.string.isRequired,
  containerClassName: PropTypes.string
};

export default Tooltip;
