import React from 'react';
import PropTypes from 'prop-types';
import ControlledFormField from './ControlledFormField';

function TextFormField(props) {
  return (
    <ControlledFormField {...props}>
      {({ id, className, name, value, onChange, ...otherProps }) => (
        <input
          {...otherProps}
          type='text'
          id={id}
          className={className}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </ControlledFormField>
  );
}

TextFormField.defaultProps = {
  id: null,
  name: null,
  value: null,
  onChange: null,
  otherProps: null
};

TextFormField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  otherProps: PropTypes.objectOf(PropTypes.any)
};

export default TextFormField;
