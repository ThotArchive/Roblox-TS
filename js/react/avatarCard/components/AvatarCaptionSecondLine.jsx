import React from 'react';
import PropTypes from 'prop-types';
import AvatarCaptionStatus from './AvatarCaptionStatus';

const AvatarCaptionSecondLine = ({ secondLine, status, statusLink }) => {
  const renderStatusContainer = secondLine || status;
  return (
    renderStatusContainer && (
      <span className='avatar-status-container'>
        {secondLine && <div className='avatar-card-label'>{secondLine}</div>}
        {status && <AvatarCaptionStatus status={status} statusLink={statusLink} />}
      </span>
    )
  );
};

AvatarCaptionSecondLine.defaultProps = {
  secondLine: '',
  status: '',
  statusLink: ''
};
AvatarCaptionSecondLine.propTypes = {
  secondLine: PropTypes.string,
  status: PropTypes.string,
  statusLink: PropTypes.string
};

export default AvatarCaptionSecondLine;
