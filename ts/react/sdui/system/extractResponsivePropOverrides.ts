import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import {
  isStringNumberOrBooleanValue,
  parseMaybeStringNumberField,
  parseStringField
} from '../utils/analyticsParsingUtils';
import { TSduiResponsiveConfig } from './SduiTypes';

enum ResponsivePropConditions {
  ImageQualityLevel = 'imageQualityLevel',
  MaxWidth = 'maxWidth'
}

const imageQualityToLevelMap: Record<string, number> = {
  low: 1,
  Low: 1,
  medium: 2,
  Medium: 2,
  high: 3,
  High: 3
};

// Web always has an Image Quality Level of High
const webImageQualityLevel = imageQualityToLevelMap.High;

/**
 * Extracts the first set of prop overrides that meet the conditions from the responsiveProps array, or {}
 */
const extractResponsivePropOverrides = (
  responsiveProps: TSduiResponsiveConfig[] | undefined,
  windowWidth: number
): Record<string, unknown> => {
  if (!responsiveProps) {
    return {};
  }

  // Find first responsive prop config where all of the conditions are met, or there are no conditions
  const firstConfigWithConditionsMet = responsiveProps.find(responsivePropConfig => {
    const { conditions } = responsivePropConfig;

    if (!conditions) {
      return true;
    }

    return Object.entries(conditions).every(([conditionKey, conditionValue]) => {
      switch (conditionKey) {
        case ResponsivePropConditions.ImageQualityLevel: {
          if (!isStringNumberOrBooleanValue(conditionValue)) {
            logSduiError(
              SduiErrorNames.InvalidImageQualityLevelConditionValue,
              `Invalid image quality level value: ${
                conditionValue ? JSON.stringify(conditionValue) : 'undefined'
              }`
            );
            return false;
          }

          const conditionImageQualityLevel =
            imageQualityToLevelMap[parseStringField(conditionValue, '')];

          if (conditionImageQualityLevel === undefined) {
            logSduiError(
              SduiErrorNames.UnknownImageQualityLevelConditionValue,
              `Unknown image quality level: ${conditionValue.toString()}`
            );
            return false;
          }

          return webImageQualityLevel === conditionImageQualityLevel;
        }
        case ResponsivePropConditions.MaxWidth: {
          if (!isStringNumberOrBooleanValue(conditionValue)) {
            logSduiError(
              SduiErrorNames.InvalidMaxWidthConditionValue,
              `Invalid max width condition value: ${
                conditionValue ? JSON.stringify(conditionValue) : 'undefined'
              }`
            );
            return false;
          }

          const maxAllowedWidth = parseMaybeStringNumberField(conditionValue, -1);

          if (maxAllowedWidth < 0) {
            logSduiError(
              SduiErrorNames.InvalidParsedMaxWidthConditionValue,
              `Cannot parse max width value: ${conditionValue.toString()}`
            );
            return false;
          }

          return maxAllowedWidth >= windowWidth;
        }
        default: {
          logSduiError(
            'UnknownResponsivePropConditionKey',
            `Unknown responsive prop condition key: ${conditionKey}`
          );
          return false;
        }
      }
    });
  });

  return firstConfigWithConditionsMet ? firstConfigWithConditionsMet.overrides : {};
};

export default extractResponsivePropOverrides;
