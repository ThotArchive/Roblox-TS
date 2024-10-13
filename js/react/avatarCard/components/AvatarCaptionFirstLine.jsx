import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

const AvatarCaptionFirstLine = ({ firstLine, firstLineLink, isSingleLine }) => {
  const singleLineClass = { 'text-overflow': isSingleLine };
  if (!firstLine) return null;
  return firstLineLink ? (
    <a
      href={firstLineLink}
      className={ClassNames('text-link', 'avatar-status-link', singleLineClass)}>
      {firstLine}
    </a>
  ) : (
    <div className={ClassNames('avatar-card-label', singleLineClass)}>{firstLine}</div>
  );
};

AvatarCaptionFirstLine.defaultProps = {
  firstLine: '',
  firstLineLink: '',
  isSingleLine: false
};
AvatarCaptionFirstLine.propTypes = {
  firstLine: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  firstLineLink: PropTypes.string,
  isSingleLine: PropTypes.bool
};

export default AvatarCaptionFirstLine;
