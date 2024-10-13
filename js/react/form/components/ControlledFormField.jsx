import React from 'react';
import PropTypes from 'prop-types';

// TODO: Add error feedback support once design is finalized
function ControlledFormField({
  id,
  name,
  label,
  value,
  children,
  errorMessage,
  onChange,
  ...otherProps
}) {
  const formFieldId = id || name;
  return (
    <div className='form-group'>
      {/* Disable this rule as it does not work well with render props,
       * we should consider changing it from 'both' to 'either'
       */}
      {/* eslint-disable-next-line jsx-a11y/label-has-for */}
      <label className='form-label' htmlFor={formFieldId}>
        {label}
        {children({
          id: formFieldId,
          className: 'form-control input-field',
          name,
          value,
          onChange,
          ...otherProps
        })}
      </label>
    </div>
  );
}

ControlledFormField.defaultProps = {
  id: '',
  name: '',
  label: '',
  value: null,
  errorMessage: '',
  onChange: null
};

ControlledFormField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.node,
  // Mark children as required since this class is meant for render props pattern
  children: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func
};

export default ControlledFormField;
