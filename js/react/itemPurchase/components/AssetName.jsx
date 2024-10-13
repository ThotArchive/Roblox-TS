import React from 'react';
import PropTypes from 'prop-types';

function AssetName({ name }) {
  return <span className='font-bold'>{name}</span>;
}
AssetName.propTypes = {
  name: PropTypes.string.isRequired
};

export default AssetName;
