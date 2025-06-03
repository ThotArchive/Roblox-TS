import { SduiRegisteredComponents, SduiComponentMapping } from './SduiComponentRegistry';
import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import { TAnalyticsContext } from './SduiTypes';

/**
 * Parse arbitrary props for a component based on the component type
 *
 * Output includes parsed props and the componentConfig, as well as the original props
 */
export const parseProps = (
  componentType: keyof typeof SduiRegisteredComponents,
  props: Record<string, unknown>,
  analyticsContext: TAnalyticsContext
): Record<string, unknown> => {
  const componentInfo = SduiComponentMapping[componentType];

  const newProps = { ...props };

  if (componentInfo) {
    const { propParsers } = componentInfo;

    if (propParsers) {
      Object.keys(props).forEach((propName: string) => {
        if (props[propName] !== undefined && propParsers[propName]) {
          const parseFunc = propParsers[propName];

          if (parseFunc && typeof parseFunc === 'function') {
            const newValue = parseFunc(props[propName], analyticsContext);

            if (newValue !== undefined) {
              newProps[propName] = newValue;
            } else {
              logSduiError(
                SduiErrorNames.PropParseFailure,
                `Failed to parse prop ${propName} with value ${JSON.stringify(
                  props[propName]
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
  }

  return newProps;
};

export default parseProps;
