import PropTypes from "prop-types";
import classNames from "classnames";

function ToastComponent({ titleText, contentText, iconClass, isToastVisible, addBackdrop }) {
  const toastContainerClass = classNames("toast-container", {
    "toast-visible": isToastVisible,
    "toast-with-icon": iconClass,
  });
  const icon = iconClass ? (
    <div className="toast-icon-container">
      <span className={iconClass} />
    </div>
  ) : null;
  const title = titleText ? (
    <div className="toast-title-container">
      <span className="font-header-1">{titleText}</span>
    </div>
  ) : null;
  const content = contentText ? (
    <div className="toast-description-container">
      <span className="font-caption-body text">{contentText}</span>
    </div>
  ) : null;
  const backdrop = addBackdrop ? <div className="modal-backdrop in" /> : null;
  return (
    <div className={toastContainerClass}>
      {backdrop}
      <div className="toast-content">
        {icon}
        <div className="toast-text-container">
          {title}
          {content}
        </div>
      </div>
    </div>
  );
}

ToastComponent.propTypes = {
  titleText: PropTypes.string,
  contentText: PropTypes.string,
  iconClass: PropTypes.string,
  isToastVisible: PropTypes.bool.isRequired,
  addBackdrop: PropTypes.bool,
};

ToastComponent.defaultProps = {
  titleText: null,
  contentText: null,
  iconClass: null,
  addBackdrop: false,
};

export default ToastComponent;
