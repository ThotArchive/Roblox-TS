import React from "react";
import PropTypes from "prop-types";
import Dropdown from "react-bootstrap/lib/Dropdown";

/* eslint-disable react/prefer-stateless-function */
class CustomToggle extends React.Component {
  render() {
    const { onKeywordChange, bsRole, bsClass, placeholder, ...otherProps } = this.props;

    return (
      <div className="input-group">
        <input
          {...otherProps}
          onKeyUp={onKeywordChange}
          type="text"
          className="form-control input-field"
          placeholder={placeholder}
          defaultValue=""
        />
        <div className="input-group-btn">
          <button type="button" className="input-addon-btn">
            <span className="icon-search" />
          </button>
        </div>
      </div>
    );
  }
}

CustomToggle.defaultProps = {
  bsRole: null,
  bsClass: null,
};

CustomToggle.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
  bsRole: PropTypes.string,
  bsClass: PropTypes.string,
};

function FilterSelect({ id, placeholder, children, onKeywordChange }) {
  return (
    <Dropdown id={id} className="input-group-btn">
      <CustomToggle bsRole="toggle" placeholder={placeholder} onKeywordChange={onKeywordChange} />
      <Dropdown.Menu bsRole="menu">{children}</Dropdown.Menu>
    </Dropdown>
  );
}

FilterSelect.defaultProps = {
  children: null,
};

FilterSelect.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default FilterSelect;
