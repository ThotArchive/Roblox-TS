import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import SimpleBar from "simplebar";

// observer used for dynamically added element
// with data-simplebar. We do not have such usecase.
// This does not work with SSR and React Hydrate.
SimpleBar.removeObserver();

function ScrollBar({ className, children, ...simpleBarOptions }) {
  const rootRef = useRef();
  useEffect(() => {
    let instance;
    if (rootRef.current) {
      instance = new SimpleBar(rootRef.current, simpleBarOptions);
    }
    return () => {
      // TODO: old, migrated code
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (rootRef.current) {
        instance.unMount();
      }
    };
  });
  return (
    <div ref={rootRef} data-simplebar className={className}>
      {children}
    </div>
  );
}
ScrollBar.defaultProps = {
  className: "",
};

ScrollBar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

export default ScrollBar;
