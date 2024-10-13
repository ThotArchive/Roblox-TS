import React from 'react';
import PropTypes from 'prop-types';

function TabContents({ children }) {
  return <div className='tab-content rbx-tab-content'>{children}</div>;
}

TabContents.defaultProps = {
  children: null
};

TabContents.propTypes = {
  children: PropTypes.node
};

export default TabContents;
