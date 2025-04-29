import PropTypes from "prop-types";
import classNames from "classnames";
import "../friends.scss";

const AvatarCaptionTitle = ({ title, titleLink, verifiedBadgeData }) => {
  // Can't use the normal import { BadgeSizes, VerifiedBadgeIcon } from 'roblox-badges'; b/c this is used on the devops site where roblox-badges does not exist.
  let iconToRender = null;

  if (window.RobloxBadges && verifiedBadgeData.hasVerifiedBadge) {
    const { VerifiedBadgeIconContainer } = window.RobloxBadges;

    iconToRender = (
      <VerifiedBadgeIconContainer
        overrideImgClass="verified-badge-friends-img"
        size={window.RobloxBadges.BadgeSizes.CAPTIONHEADER}
        titleText={verifiedBadgeData.titleText}
      />
    );
  }

  return (
    <div
      className={classNames(`avatar-name-container`, {
        verified: verifiedBadgeData.hasVerifiedBadge,
        shimmer: !title,
      })}
    >
      {titleLink ? (
        <a href={titleLink} className="text-overflow avatar-name">
          {title}
        </a>
      ) : (
        <div className="text-overflow avatar-name">{title}</div>
      )}
      {iconToRender}
    </div>
  );
};

AvatarCaptionTitle.defaultProps = {
  title: "",
  titleLink: "",
  verifiedBadgeData: {},
};
AvatarCaptionTitle.propTypes = {
  title: PropTypes.string,
  titleLink: PropTypes.string,
  verifiedBadgeData: PropTypes.shape({
    hasVerifiedBadge: PropTypes.bool,
    titleText: PropTypes.string,
  }),
};

export default AvatarCaptionTitle;
