import PropTypes from "prop-types";
import { thumbnailStatus, status } from "../constants";

// TODO: refactor only use headshot css class
const AvatarHeadshot = ({
  imageLink,
  status,
  statusLink,
  thumbnail,
  statusIcon,
  handleImageClick,
}) => {
  const presenceStatusIcon = statusIcon ?? <span className={`icon-${status}`} />;

  return (
    <div className="avatar avatar-card-fullbody" data-testid="avatar-card-container">
      {imageLink ? (
        <a
          href={imageLink}
          onClick={handleImageClick}
          className="avatar-card-link"
          data-testid="avatar-card-link"
        >
          {thumbnail}
        </a>
      ) : (
        thumbnail
      )}
      {statusLink ? (
        <a href={statusLink} className="avatar-status">
          {presenceStatusIcon}
        </a>
      ) : (
        <div className="avatar-status">{presenceStatusIcon}</div>
      )}
    </div>
  );
};

AvatarHeadshot.defaultProps = {
  imageLink: "",
  status: "offline",
  statusIcon: undefined,
  statusLink: "",
  thumbnail: null,
  handleImageClick: undefined,
};

AvatarHeadshot.propTypes = {
  imageLink: PropTypes.string,
  status: PropTypes.oneOf(Object.values(status)),
  statusIcon: PropTypes.element,
  statusLink: PropTypes.string,
  thumbnail: PropTypes.element,
  handleImageClick: PropTypes.func,
};

AvatarHeadshot.statusType = status;
AvatarHeadshot.imageStatus = thumbnailStatus;

export default AvatarHeadshot;
