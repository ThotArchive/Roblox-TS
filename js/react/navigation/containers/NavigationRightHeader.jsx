import React, { useState, useEffect, useCallback } from 'react';
import { withTranslations } from 'react-utilities';
import { translationConfig } from '../translation.config';
import { UniversalSearchContainer } from './UniversalSearch';
import HeaderRightNav from '../components/HeaderRightNav';
import navigationUtil from '../util/navigationUtil';

function NavigationRightHeader(props) {
  const isCurrentMobileSize = navigationUtil.isInMobileSize();
  const [isInMobileSize, setMobileSize] = useState(isCurrentMobileSize);
  const [isUniverseSearchShown, setUniverseSearchShown] = useState(!isCurrentMobileSize);

  const toggleUniverseSearch = () => {
    setUniverseSearchShown(isShown => !isShown);
  };

  const resizeEventHandler = useCallback(() => {
    const isCurrentWindowMobileSize = navigationUtil.isInMobileSize();
    if (isInMobileSize !== isCurrentWindowMobileSize) {
      setMobileSize(isCurrentWindowMobileSize);
      setUniverseSearchShown(!isCurrentWindowMobileSize);
    }
  }, [isInMobileSize]);

  useEffect(() => {
    window.addEventListener('resize', resizeEventHandler);

    return () => {
      window.removeEventListener('resize', resizeEventHandler);
    };
  }, [resizeEventHandler]);

  return (
    <React.Fragment>
      <UniversalSearchContainer isUniverseSearchShown={isUniverseSearchShown} {...props} />
      <HeaderRightNav toggleUniverseSearch={toggleUniverseSearch} {...props} />
    </React.Fragment>
  );
}

export default withTranslations(NavigationRightHeader, translationConfig);
