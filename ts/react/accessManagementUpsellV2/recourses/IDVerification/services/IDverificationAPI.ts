import { httpService } from 'core-utilities';
import * as QRCode from 'qrcode';
import {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig
} from '../constants/urlConstants';
import { VerificationErrorCode } from '../../../enums';

// function to fetch AMP response
export const fetchFeatureCheckResponse = (featureName: string) => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true };
  return httpService
    .post(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      throw new Error('Error checking AMP feature access');
    });
};

export const startPersonaIdVerification = () => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true };
  return httpService
    .post(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      throw new Error(`Error to start ID verification: ${errorCode || 'unknown'}`);
    });
};

export const getPersonaVerificationStatus = (token: string) => {
  const urlConfig = getPersonaVerificationStatusUrlConfig();
  const params = { token };
  return httpService
    .get(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      throw new Error(`Error to get ID verification status: ${errorCode || 'unknown'}`);
    });
};

export const fetchQRCode = (verificationLink: string) => {
  let qrcode;
  QRCode.toDataURL(verificationLink, (error, url) => {
    qrcode = url;
  });
  return qrcode;
};
