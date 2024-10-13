import { TCaptchaInputParams } from '../types/captchaTypes';
import { TSecurityQuestionsInputParam } from '../types/securityQuestionsTypes';
import { TUserData, TMultipleUsersPerCredentialErrorData } from '../types/accountSelectorTypes';
/**
 * Parses a JavaScript object, which can take on any type, into an array of
 * field data based on the typical schema returned by our back-end.
 */
const getApiFieldDataString = (error: unknown): string[] => {
  const fieldDataString: string[] = [];
  if (!error || typeof error !== 'object') {
    return [];
  }

  const { errors } = error as Record<string, unknown>;
  if (!(errors instanceof Array)) {
    return [];
  }

  errors.forEach((errorObject: unknown) => {
    if (!errorObject || typeof errorObject !== 'object') {
      return;
    }

    const { fieldData } = errorObject as Record<string, unknown>;
    if (typeof fieldData === 'string') {
      fieldDataString.push(fieldData);
    }
  });

  return fieldDataString;
};

interface captchaDataObj {
  dxBlob: string;
  unifiedCaptchaId: string;
}

/**
 * Gets a captcha data object from error thrown by Axios.
 */
export const parseCaptchaData = (error: unknown): TCaptchaInputParams => {
  const fieldDataString = getApiFieldDataString(error);
  if (typeof error === 'object') {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    getApiFieldDataString((error as Record<string, unknown>).data).forEach(item =>
      fieldDataString.push(item)
    );
  }
  const captchaDataStr = fieldDataString[0] || ',';
  // the login response has captcha data as a JSON, but the signup response returns captcha data as a comma separated string
  // if we fail to parse as a JSON, we know the data is either missing, or is from signup
  try {
    const jsonData = JSON.parse(captchaDataStr) as captchaDataObj;
    const { dxBlob } = jsonData;
    const captchaId = jsonData.unifiedCaptchaId;
    const captchaData: TCaptchaInputParams = {
      dataExchange: dxBlob,
      unifiedCaptchaId: captchaId
    };
    return captchaData;
  } catch {
    const dataArray = captchaDataStr.split(',');
    const captchaData: TCaptchaInputParams = {
      unifiedCaptchaId: dataArray[0],
      dataExchange: dataArray[1]
    };
    return captchaData;
  }
};

/**
 * Gets a security questions data object from error thrown by Axios.
 */
export const parseSecurityQuestionsData = (error: unknown): TSecurityQuestionsInputParam => {
  const fieldDataString = getApiFieldDataString(error);
  if (typeof error === 'object') {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    getApiFieldDataString((error as Record<string, unknown>).data).forEach(item =>
      fieldDataString.push(item)
    );
  }
  const securityQuestionsDataStr = fieldDataString[0] || '';
  const jsonData = JSON.parse(securityQuestionsDataStr) as TSecurityQuestionsInputParam;
  const { userId, sessionId } = jsonData;
  const securityQuestionsData: TSecurityQuestionsInputParam = {
    userId,
    sessionId
  };
  return securityQuestionsData;
};

/**
 * Gets a users data object from error thrown by Axios.
 * errors object will resemble the following example
 * {
 * "errors": [
 *   {
 *     "code": 20,
 *     "message": "Received credentials belong to multiple accounts",
 *     "userFacingMessage": "Something went wrong",
 *     "fieldData": "{"users":[{"id":123,"name":"testusername","displayName":"testdisplayname"},
 *       {"id":456,"name":"testusername2","displayName":"testdisplayname2"}]}"
 *   }
 * ]
 *}
 */
export const parseUsersData = (error: unknown): TMultipleUsersPerCredentialErrorData => {
  const multipleUsersPerCredentialErrorData = {
    users: [] as TUserData[],
    invalidUsers: [] as TUserData[]
  };
  const fieldDataString = getApiFieldDataString(error);
  if (typeof error === 'object') {
    // Sometimes the response returned by Axios hides the errors in `error.data`.
    getApiFieldDataString((error as Record<string, unknown>).data).forEach(item =>
      fieldDataString.push(item)
    );
    const usersDataStr = fieldDataString[0] || '';
    const jsonData = JSON.parse(usersDataStr) as Record<string, TUserData[]>;
    const { users, invalidUsers } = jsonData;
    multipleUsersPerCredentialErrorData.users = users ?? ([] as TUserData[]);
    multipleUsersPerCredentialErrorData.invalidUsers = invalidUsers ?? ([] as TUserData[]);
  }
  return multipleUsersPerCredentialErrorData;
};
