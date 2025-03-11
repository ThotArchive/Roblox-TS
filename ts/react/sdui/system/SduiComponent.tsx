import React, { useMemo } from 'react';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { getComponentFromType } from './SduiComponentRegistry';
import { TSduiComponentProps } from './wrapComponentForSdui';
import SduiResponsiveWrapper from './SduiResponsiveWrapper';

/**
 * Renders an SDUI component based on the component config
 * The component to render should be registered in SduiComponentMapping
 * and contain handling (through wrapComponentForSdui) to map the server config to the component props
 */
const SduiComponent = ({
  componentConfig,
  parentAnalyticsContext,
  localAnalyticsData
}: TSduiComponentProps): JSX.Element => {
  const toRender = useMemo(() => {
    const { componentType } = componentConfig;

    const componentToRender = getComponentFromType(componentType);

    if (!componentToRender) {
      logSduiError(
        SduiErrorNames.ComponentNotFound,
        `Component not found for type ${componentType} using config ${JSON.stringify(
          componentConfig
        )}`
      );

      return <React.Fragment />;
    }

    if (componentConfig.responsiveProps) {
      return (
        <SduiResponsiveWrapper
          wrappedComponent={componentToRender}
          componentConfig={componentConfig}
          parentAnalyticsContext={parentAnalyticsContext}
          localAnalyticsData={localAnalyticsData}
        />
      );
    }

    return React.createElement(componentToRender, {
      componentConfig,
      parentAnalyticsContext,
      localAnalyticsData
    });
  }, [componentConfig, parentAnalyticsContext, localAnalyticsData]);

  return toRender;
};

export default SduiComponent;
