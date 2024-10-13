import { phoneSubmissionConstants } from '../constants/phoneConstants';

const { CodeLength } = phoneSubmissionConstants;
const getCleanInputCode = originalCode => {
  const numericCharacters = originalCode.replace(/[^0-9]/g, '');
  return numericCharacters.substring(0, CodeLength);
};

export { getCleanInputCode as default };
