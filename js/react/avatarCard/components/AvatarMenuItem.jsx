import React from 'react';
import PropTypes from 'prop-types';

const MenuItem = ({ title, show = true, link, onClick, className }) => {
  if (!show) return null;
  return (
    <li>
      <a className={className} href={link || '#'} onClick={onClick}>
        {title}
      </a>
    </li>
  );
};

MenuItem.defaultProps = {
  className: '',
  show: true,
  link: ''
};

MenuItem.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  show: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  link: PropTypes.string
};

export default MenuItem;
