import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import {
  disconnectFacebookUrlConfig,
  setPasswordUrlConfig
} from '../constants/facebookSunsetConstants';

export const openFacebookSunsetModal = closeCallback => {
  const FacebookSunsetEvent = new CustomEvent('OpenFacebookSunsetModal', {
    detail: {
      closeCallback
    }
  });
  window.dispatchEvent(FacebookSunsetEvent);
};

export const setPassword = (oldPassword, newPassword) => {
  const urlConfig = setPasswordUrlConfig();
  const passwordData = { oldPassword, newPassword };
  return httpService
    .post(urlConfig, passwordData)
    .then(data => {
      return data;
    })
    .catch(e => e);
};

export const disconnectFacebook = () => {
  const urlConfig = disconnectFacebookUrlConfig();
  return httpService
    .post(urlConfig)
    .then(data => {
      return data;
    })
    .catch(e => console.debug(e));
};

export const sendFacebookSunsetEvent = event => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params,
    origin: event.origin
  });
};
