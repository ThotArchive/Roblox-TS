import React from "react";
import PropTypes from "prop-types";

function AvatarCardList({ data, children }) {
  const listView = data.reduce((list, child, position) => {
    const view = children(child, position);
    if (view) list.push(React.cloneElement(view, { key: view.key }));
    return list;
  }, []);
  return <ul className="hlist avatar-cards">{listView}</ul>;
}

AvatarCardList.propTypes = {
  children: PropTypes.func.isRequired,
  // TODO: old, migrated code
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default AvatarCardList;
