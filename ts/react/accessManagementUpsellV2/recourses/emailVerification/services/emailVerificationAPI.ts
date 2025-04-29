import { httpService } from 'core-utilities';
import { getEmailUrlConfig, getEmailVerificationUrlConfig } from '../constants/urlConstants';

export type UserEmailData = {
  emailAddress: string;
};

export const sendEmailVerification = () => {
  const urlConfig = getEmailVerificationUrlConfig();
  return httpService.post(urlConfig).then(
    () => {
      return true;
    },
    () => {
      return false;
    }
  );
};

export const updateEmailAddress = (data: UserEmailData) => {
  const urlConfig = getEmailUrlConfig();
  return httpService
    .post(urlConfig, data)
    .then(() => {
      return true;
    })
    .catch(err => {
      throw new Error(`Error to update email address: ${JSON.stringify(err)}`);
    });
};

export const getUserEmailStatus = () => {
  const urlConfig = getEmailUrlConfig();
  return httpService
    .get(urlConfig)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      throw new Error(`Error to get email address: ${JSON.stringify(err)}`);
    });
};

export const validateEmailAddress = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
