import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Button from '../../button/components/ButtonBase';

function Toggle({ isOn, className, isDisabled, onToggle, id }) {
  const classNames = ClassNames('btn-toggle', className, {
    disabled: isDisabled,
    on: isOn
  });

  const handleToggle = () => {
    onToggle(!isOn);
  };

  return (
    <Button
      id={id}
      type='button'
      className={classNames}
      onClick={handleToggle}
      disabled={isDisabled}>
      <span className='toggle-flip' />
      <span className='toggle-on' />
      <span className='toggle-off' />
    </Button>
  );
}

Toggle.defaultProps = {
  isDisabled: false,
  onToggle: () => {},
  className: '',
  id: ''
};

Toggle.propTypes = {
  isOn: PropTypes.bool.isRequired,
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
  onToggle: PropTypes.func,
  id: PropTypes.string
};

export default Toggle;
