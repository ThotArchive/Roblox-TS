import PropTypes from "prop-types";
import React from "react";
import { Header, Title } from "react-bootstrap/lib/Modal";
import Button from "../../button/components/ButtonBase";

function RobloxModalHeader(props) {
  const { useBaseBootstrapComponent, title, showCloseButton, onClose, ...otherProps } = props;
  if (useBaseBootstrapComponent === true) {
    // Filter non-DOM attributes.
    const bootstrapProps = { title, ...otherProps };
    return <Header {...bootstrapProps} />;
  }
  const modalTitle = React.isValidElement(title) ? <Title as={title} /> : <Title>{title}</Title>;

  const modalClose = showCloseButton ? (
    <Button type="button" className="close" onClick={onClose} title="close">
      <span className="icon-close" />
    </Button>
  ) : null;
  return (
    <Header {...otherProps} onHide={onClose}>
      {modalClose}
      {modalTitle}
    </Header>
  );
}

RobloxModalHeader.defaultProps = {
  useBaseBootstrapComponent: false,
  title: "",
  showCloseButton: true,
  onClose: null,
};

RobloxModalHeader.propTypes = {
  // This prop exists for web apps that did not originally use the style guide
  // modals to have an escape-hatch into the base `react-bootstrap` component.
  // In the long-run, we hope to unify these disparate usages.
  useBaseBootstrapComponent: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  showCloseButton: PropTypes.bool,
  onClose: PropTypes.func,
};

export default RobloxModalHeader;
