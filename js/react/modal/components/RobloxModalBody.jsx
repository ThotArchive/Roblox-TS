import React from 'react';
import PropTypes from 'prop-types';
import { Body } from 'react-bootstrap/lib/Modal';

function RobloxModalBody({ children, ...otherProps }) {
  return <Body {...otherProps}>{children}</Body>;
}

RobloxModalBody.defaultProps = {
  children: null
};

RobloxModalBody.propTypes = {
  children: PropTypes.node
};

export default RobloxModalBody;
