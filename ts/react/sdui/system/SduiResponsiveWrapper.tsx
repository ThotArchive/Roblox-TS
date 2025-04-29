import React, { useEffect, useMemo, useState } from 'react';
import { TSduiComponentProps } from './wrapComponentForSdui';

import extractResponsivePropOverrides from './extractResponsivePropOverrides';

type TSduiResponsiveWrapperProps = {
  wrappedComponent: React.ComponentType<TSduiComponentProps>;
} & TSduiComponentProps;

const SduiResponsiveWrapper = ({
  wrappedComponent,
  componentConfig,
  parentAnalyticsContext,
  sduiContext,
  localAnalyticsData
}: TSduiResponsiveWrapperProps): JSX.Element => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const responsivePropOverrides: Record<string, unknown> = useMemo(() => {
    return extractResponsivePropOverrides(componentConfig.responsiveProps, windowWidth);
  }, [componentConfig, windowWidth]);

  return React.createElement(wrappedComponent, {
    componentConfig,
    parentAnalyticsContext,
    sduiContext,
    localAnalyticsData,
    responsivePropOverrides
  });
};

export default SduiResponsiveWrapper;
