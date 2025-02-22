import React from 'react';
import PropTypes from 'prop-types';
import thumbnailConstants from '../constants/thumbnail';
import statusContants from '../constants/statusType';

const { THUMBNAIL_STATUS } = thumbnailConstants;
const { STATUS_TYPES } = statusContants;

// TODO: refactor only use headshot css class
const AvatarHeadshot = ({
  imageLink,
  status,
  statusLink,
  thumbnail,
  statusIcon,
  handleImageClick
}) => {
  const getStatusIconClass = () => {
    return `icon-${status}`;
  };

  const presenceStatusIcon = statusIcon ?? <span className={getStatusIconClass()} />;

  return (
    <div className='avatar avatar-card-fullbody' data-testid='avatar-card-container'>
      {imageLink ? (
        <a
          href={imageLink}
          onClick={handleImageClick}
          className='avatar-card-link'
          data-testid='avatar-card-link'>
          {thumbnail}
        </a>
      ) : (
        thumbnail
      )}
      {statusLink ? (
        <a href={statusLink} className='avatar-status'>
          {presenceStatusIcon}
        </a>
      ) : (
        <div className='avatar-status'>{presenceStatusIcon}</div>
      )}
    </div>
  );
};

AvatarHeadshot.defaultProps = {
  imageLink: '',
  status: 'offline',
  statusIcon: undefined,
  statusLink: '',
  thumbnail: null,
  handleImageClick: undefined
};

AvatarHeadshot.propTypes = {
  imageLink: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUS_TYPES)),
  statusIcon: PropTypes.element,
  statusLink: PropTypes.string,
  thumbnail: PropTypes.element,
  handleImageClick: PropTypes.func
};

AvatarHeadshot.statusType = STATUS_TYPES;
AvatarHeadshot.imageStatus = THUMBNAIL_STATUS;

export default AvatarHeadshot;
