import React from 'react';
import PropTypes from 'prop-types';

const CardContent = ({ children }) => <div className='avatar-card-content'>{children}</div>;
CardContent.propTypes = {
  children: PropTypes.node.isRequired
};

export default CardContent;
