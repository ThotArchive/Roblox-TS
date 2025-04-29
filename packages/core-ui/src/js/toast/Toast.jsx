import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

import ToastComponent from "./ToastComponent";

function Toast({ titleText, contentText, iconClass, timeout, enableToast, addBackdrop }) {
  const [isToastVisible, updateToastVisibility] = useState(false);
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (enableToast) {
      updateToastVisibility(true);
      timeoutRef.current = setTimeout(() => updateToastVisibility(false), timeout);
    } else {
      resetTimer();
    }
  }, [enableToast, timeout]);

  return (
    <ToastComponent
      titleText={titleText}
      contentText={contentText}
      iconClass={iconClass}
      isToastVisible={isToastVisible}
      addBackdrop={addBackdrop}
    />
  );
}
Toast.propTypes = {
  titleText: PropTypes.string,
  contentText: PropTypes.string,
  iconClass: PropTypes.string,
  timeout: PropTypes.number,
  enableToast: PropTypes.bool,
  addBackdrop: PropTypes.bool,
};

Toast.defaultProps = {
  titleText: null,
  contentText: null,
  iconClass: null,
  timeout: 3000,
  enableToast: false,
  addBackdrop: false,
};

export default Toast;
