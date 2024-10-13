import React from 'react';
import PropTypes from 'prop-types';

const AvatarCaptionFooter = ({ footer }) => {
  return <div className='avatar-card-footer avatar-card-label'>{footer}</div>;
};

AvatarCaptionFooter.defaultProps = {
  footer: ''
};
AvatarCaptionFooter.propTypes = {
  footer: PropTypes.node
};

export default AvatarCaptionFooter;
