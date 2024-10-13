import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedUser } from 'header-scripts';
import { withTranslations } from 'react-utilities';
import layoutConstant from '../constants/layoutConstants';
import { translationConfig } from '../translation.config';
import LeftNavigationComponent from '../components/LeftNavigation';

const { headerMenuIconClickEvent } = layoutConstant;

function LeftNavigation(props) {
  const { isAuthenticated } = authenticatedUser;
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);

  const onClickMenuIcon = useCallback(() => {
    setIsLeftNavOpen(!isLeftNavOpen);
  }, [isLeftNavOpen]);

  useEffect(() => {
    document.addEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    return () => {
      document.removeEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    };
  }, [onClickMenuIcon]);

  return isAuthenticated ? <LeftNavigationComponent {...{ isLeftNavOpen, ...props }} /> : null;
}

export default withTranslations(LeftNavigation, translationConfig);
