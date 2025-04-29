import React, { useMemo } from 'react';
import SduiComponent from './SduiComponent';
import { parseProps } from './parseProps';
import { isValidSduiComponentConfig } from './SduiParsers';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { TAnalyticsContext, TAnalyticsData, TServerDrivenComponentConfig } from './SduiTypes';

const generateReactChildren = (
  componentConfig: TServerDrivenComponentConfig,
  parentAnalyticsContext: TAnalyticsContext
): JSX.Element[] | null => {
  if (componentConfig.children) {
    return componentConfig.children.map(
      (childConfig: TServerDrivenComponentConfig, index): JSX.Element => {
        const id = `${childConfig.componentType}-${index}`;
        return (
          <SduiComponent
            key={id}
            componentConfig={childConfig}
            parentAnalyticsContext={parentAnalyticsContext}
          />
        );
      }
    );
  }

  return null;
};

const buildAnalyticsContext = (
  componentConfig: TServerDrivenComponentConfig,
  parentAnalyticsContext: TAnalyticsContext,
  localAnalyticsData?: TAnalyticsData
): TAnalyticsContext => {
  const { analyticsData } = componentConfig;

  const resultAnalyticsData = {
    ...analyticsData,
    ...(localAnalyticsData ?? {})
  };

  const { logAction, getCollectionData } = parentAnalyticsContext;

  const ancestorAnalyticsData = {
    ...parentAnalyticsContext.ancestorAnalyticsData,
    ...parentAnalyticsContext.analyticsData
  };

  return {
    analyticsData: resultAnalyticsData,
    ancestorAnalyticsData,

    // Pass through logAction and getCollectionData to any descendents
    logAction,
    getCollectionData
  };
};

const buildReactPropsAndChildren = (
  componentConfig: TServerDrivenComponentConfig,
  parentAnalyticsContext: TAnalyticsContext,
  localAnalyticsData?: TAnalyticsData,
  responsivePropOverrides?: Record<string, unknown>
): {
  props: Record<string, unknown>;
  children: React.ReactNode;
} => {
  if (!isValidSduiComponentConfig(componentConfig)) {
    logSduiError(
      SduiErrorNames.SduiComponentBuildPropsAndChildrenInvalidConfig,
      `Invalid component config ${JSON.stringify(
        componentConfig
      )} to build React props and children`
    );

    return {
      props: {},
      children: null
    };
  }

  const { componentType } = componentConfig;

  const builtAnalyticsContext = buildAnalyticsContext(
    componentConfig,
    parentAnalyticsContext,
    localAnalyticsData
  );

  const reactProps = {
    ...componentConfig.props,
    componentConfig,
    analyticsContext: builtAnalyticsContext,
    ...responsivePropOverrides
  };

  const parsedProps = parseProps(componentType, reactProps, builtAnalyticsContext);

  const reactChildren = generateReactChildren(componentConfig, builtAnalyticsContext);

  return {
    props: parsedProps,
    children: reactChildren
  };
};

// Expected input to wrapper / prop parsing operations
export type TSduiComponentProps = {
  componentConfig: TServerDrivenComponentConfig;

  parentAnalyticsContext: TAnalyticsContext;

  localAnalyticsData?: TAnalyticsData;

  responsivePropOverrides?: Record<string, unknown>;
};

/**
 * Wraps a component to be used with Server Driven UI
 *
 * The wrapper maps the componentConfig and server props to the React props and children
 * that the wrapped component is expecting to receive
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapComponentForSdui = (component: React.FC<any>): React.FC<TSduiComponentProps> => {
  const WrappedComponent = React.memo((sduiProps: TSduiComponentProps) => {
    return useMemo(() => {
      const { props, children } = buildReactPropsAndChildren(
        sduiProps.componentConfig,
        sduiProps.parentAnalyticsContext,
        sduiProps.localAnalyticsData,
        sduiProps.responsivePropOverrides
      );

      return React.createElement(component, props, children);
    }, [
      sduiProps.componentConfig,
      component,
      sduiProps.parentAnalyticsContext,
      sduiProps.localAnalyticsData,
      sduiProps.responsivePropOverrides
    ]);
  });

  WrappedComponent.displayName = `SduiWrapped${component.displayName || component.name}`;

  return WrappedComponent;
};

export default wrapComponentForSdui;
