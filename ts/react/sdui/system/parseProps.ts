import { SduiRegisteredComponents, SduiComponentMapping } from './SduiComponentRegistry';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { TAnalyticsContext, TSduiContext, TSduiPropParserObject } from './SduiTypes';
import { isStringKeyObject } from './SduiParsers';

/**
 * Parse arbitrary props for a component based on the component type
 *
 * Output includes parsed props and the componentConfig, as well as the original props
 */
export const parseProps = (
  componentType: keyof typeof SduiRegisteredComponents,
  props: Record<string, unknown>,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
  parsersOverride?: TSduiPropParserObject
): Record<string, unknown> => {
  const componentInfo = SduiComponentMapping[componentType];

  const newProps = { ...props };

  const propParsers = parsersOverride ?? componentInfo?.propParsers;

  if (propParsers) {
    Object.keys(props).forEach((propName: string) => {
      const propValue = props[propName];
      const parser = propParsers[propName];

      if (propValue !== undefined && parser) {
        if (typeof parser === 'function') {
          const newValue = parser(propValue, analyticsContext, sduiContext);

          if (newValue !== undefined) {
            newProps[propName] = newValue;
          } else {
            logSduiError(
              SduiErrorNames.PropParseFailure,
              `Failed to parse prop ${propName} with value ${JSON.stringify(
                propValue
              )} for component ${componentType}`
            );
          }
        } else if (typeof parser === 'object') {
          // Parse nested props using the nested prop parsers
          if (isStringKeyObject(propValue)) {
            newProps[propName] = parseProps(
              componentType,
              propValue,
              analyticsContext,
              sduiContext,
              parser
            );
          } else {
            logSduiError(
              SduiErrorNames.NestedPropParseFailure,
              `Expected a nested object for prop ${propName} with value ${JSON.stringify(
                propValue
              )} using for component ${componentType}`
            );
          }
        } else {
          logSduiError(
            SduiErrorNames.PropParserNotFound,
            `Prop parser not found for prop ${propName} and component ${componentType}`
          );
        }
      }
    });
  }

  return newProps;
};

export default parseProps;
