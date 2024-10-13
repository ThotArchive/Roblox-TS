import React from 'react';
import PropTypes from 'prop-types';
import TabNav from './TabNav';
import TabNavs from './TabNavs';
import TabContent from './TabContent';
import TabContents from './TabContents';
import TabsContainer from './TabsContainer';

function Tabs({ children, ...otherProps }) {
  const navTabs = [];
  const contentTabs = [];

  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === TabNav) {
        navTabs.push(child);
      }

      if (child.type === TabContent) {
        contentTabs.push(child);
      }
    }
  });

  return (
    <TabsContainer {...otherProps}>
      <TabNavs>{navTabs}</TabNavs>
      <TabContents>{contentTabs}</TabContents>
    </TabsContainer>
  );
}

Tabs.defaultProps = {
  children: null
};

Tabs.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node)
};

Tabs.TabNav = TabNav;
Tabs.TabNavs = TabNavs;
Tabs.TabContent = TabContent;
Tabs.TabContents = TabContents;
Tabs.TabsContainer = TabsContainer;

export default Tabs;
