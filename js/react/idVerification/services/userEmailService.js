import { httpService } from 'core-utilities';
import { getEmailUrlConfig, getEmailVerificationUrlConfig } from '../constants/urlConstants';

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

export const updateEmailAddress = formData => {
  const urlConfig = getEmailUrlConfig();
  return httpService.post(urlConfig, formData).then(
    () => {
      return true;
    },
    e => {
      return e.data.errors && e.data.errors[0].code;
    }
  );
};

export const getUserEmailAddress = () => {
  const urlConfig = getEmailUrlConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      return data?.emailAddress;
    },
    () => {
      return false;
    }
  );
};

export const validateEmailAddress = email => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const getUserEmailStatus = () => {
  const urlConfig = getEmailUrlConfig();
  return httpService.get(urlConfig).then(
    ({ data }) => {
      return data;
    },
    () => {
      return false;
    }
  );
};
