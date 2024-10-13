import React from 'react';
import PropTypes from 'prop-types';

// TODO: make generic button group that supports different layout
const AvatarButtonGroup = ({ children }) => {
  return <div className='avatar-card-btns'>{children}</div>;
};
AvatarButtonGroup.defaultProps = {
  children: null
};

AvatarButtonGroup.propTypes = {
  children: PropTypes.node
};

export default AvatarButtonGroup;
