import PropTypes from "prop-types";
import classNames from "classnames";

const AvatarCardItem = ({ id, disableCard, children }) => (
  <li id={id} className="list-item avatar-card">
    <div
      className={classNames("avatar-card-container", {
        disabled: disableCard,
      })}
    >
      {children}
    </div>
  </li>
);

AvatarCardItem.defaultProps = {
  id: "",
  disableCard: false,
  children: null,
};
AvatarCardItem.propTypes = {
  id: PropTypes.number,
  disableCard: PropTypes.bool,
  children: PropTypes.node,
};

export default AvatarCardItem;
