import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig,
  getVerifiedAgeUrlConfig
} from '../constants/urlConstants';
import { ModalEvent } from '../constants/viewConstants';

export const startPersonaIdVerification = () => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true };
  return httpService.post(urlConfig, params).then(
    ({ data }) => {
      return data;
    },
    () => {
      return false;
    }
  );
};

export const getVerifiedAge = () => {
  const urlConfig = getVerifiedAgeUrlConfig();
  return httpService.get(urlConfig).then(({ data }) => {
    return data;
  });
};

export const getPersonaVerificationStatus = token => {
  const urlConfig = getPersonaVerificationStatusUrlConfig();
  const params = { token };
  return httpService.get(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const sendIdVerificationEvent = (event, params) => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params,
    origin: params.origin
  });
};

export const startVerificationFlow = () =>
  new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.OpenIdentityVerificationModal, {
      detail: {
        successCallback: (isUserOldEnough, didVerifyAge) => {
          resolve([isUserOldEnough, didVerifyAge]);
        }
      }
    });
    window.dispatchEvent(event);
  });
