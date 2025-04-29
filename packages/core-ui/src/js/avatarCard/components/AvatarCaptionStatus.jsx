import PropTypes from "prop-types";

const AvatarCaptionSecondLine = ({ status, statusLink }) =>
  statusLink ? (
    <a href={statusLink} className="text-link text-overflow avatar-status-link">
      {status}
    </a>
  ) : (
    <div className="text-overflow avatar-status-link">{status}</div>
  );

AvatarCaptionSecondLine.defaultProps = {
  status: "",
  statusLink: "",
};
AvatarCaptionSecondLine.propTypes = {
  status: PropTypes.string,
  statusLink: PropTypes.string,
};

export default AvatarCaptionSecondLine;
