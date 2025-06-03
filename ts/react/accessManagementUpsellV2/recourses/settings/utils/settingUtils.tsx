import { UserSetting } from '../../../../legallySensitiveContent/enums/UserSetting';
import PhoneNumberDiscoverability from '../../../../legallySensitiveContent/enums/PhoneNumberDiscoverability';

/**
 * Converts a boolean value to a string setting value based on the setting name.
 * This utility function maps boolean states to their corresponding string representations
 * for different user settings.
 *
 * @param {boolean} value - The boolean value to convert
 * @param {UserSetting} settingName - The type of user setting being modified
 * @returns {string} The string representation of the setting value
 */
export const booleanToSettingValue = (value: boolean, settingName: UserSetting): string => {
  // TODO: Add other setting values that can be converted to boolean
  switch (settingName) {
    case UserSetting.phoneNumberDiscoverability:
      return value
        ? PhoneNumberDiscoverability.Discoverable
        : PhoneNumberDiscoverability.NotDiscoverable;
    default:
      return (value as unknown) as string;
  }
};

export default booleanToSettingValue;
