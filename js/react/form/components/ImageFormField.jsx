import React from 'react';
import FileFormField from './FileFormField';

function ImageFormField(props) {
  return <FileFormField accept='image/*' {...props} />;
}

export default ImageFormField;
