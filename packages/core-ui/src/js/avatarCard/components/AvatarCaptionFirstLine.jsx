import PropTypes from "prop-types";
import classNames from "classnames";

const AvatarCaptionFirstLine = ({ firstLine, firstLineLink, isSingleLine }) => {
  const singleLineClass = { "text-overflow": isSingleLine };
  if (!firstLine) return null;
  return firstLineLink ? (
    <a
      href={firstLineLink}
      className={classNames("text-link", "avatar-status-link", singleLineClass)}
    >
      {firstLine}
    </a>
  ) : (
    <div className={classNames("avatar-card-label", singleLineClass)}>{firstLine}</div>
  );
};

AvatarCaptionFirstLine.defaultProps = {
  firstLine: "",
  firstLineLink: "",
  isSingleLine: false,
};
AvatarCaptionFirstLine.propTypes = {
  firstLine: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  firstLineLink: PropTypes.string,
  isSingleLine: PropTypes.bool,
};

export default AvatarCaptionFirstLine;
