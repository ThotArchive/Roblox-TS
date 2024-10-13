import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

const AvatarCardItem = ({ id, disableCard, children }) => {
  const classNames = ClassNames('avatar-card-container', {
    disabled: disableCard
  });
  return (
    <li id={id} className='list-item avatar-card'>
      <div className={classNames}>{children}</div>
    </li>
  );
};

AvatarCardItem.defaultProps = {
  id: '',
  disableCard: false,
  children: null
};
AvatarCardItem.propTypes = {
  id: PropTypes.number,
  disableCard: PropTypes.bool,
  children: PropTypes.node
};

export default AvatarCardItem;
