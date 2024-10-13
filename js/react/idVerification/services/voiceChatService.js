import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import {
  getShowOverlayUrlConfig,
  getPostOptUserInToVoiceChatUrlConfig,
  getPostOptUserInToAvatarChatUrlConfig,
  getRecordUserSeenUpsellModalUrlConfig,
  getRecordUserSeenAvatarVideoUpsellModalUrlConfig
} from '../constants/urlConstants';
import { ModalEvent } from '../constants/viewConstants';

export const postShowOverlay = showOverlay => {
  const urlConfig = getShowOverlayUrlConfig();
  const params = { showOverlay };
  return httpService.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const postOptUserInToVoiceChat = (isUserOptIn, isOptedInThroughUpsell) => {
  const urlConfig = getPostOptUserInToVoiceChatUrlConfig();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  return httpService.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const postOptUserInToAvatarChat = (isUserOptIn, isOptedInThroughUpsell) => {
  const urlConfig = getPostOptUserInToAvatarChatUrlConfig();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  return httpService.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const recordUserSeenUpsellModal = () => {
  const urlConfig = getRecordUserSeenUpsellModalUrlConfig();
  const params = {};

  return httpService.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const recordUserSeenAvatarVideoUpsellModal = () => {
  const urlConfig = getRecordUserSeenAvatarVideoUpsellModalUrlConfig();
  const params = {};

  return httpService.post(urlConfig, params).then(({ data }) => {
    return data;
  });
};

export const showVoiceOptInOverlay = (requireExplicitVoiceConsent, useVoiceUpsellV2Design) =>
  new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.OpenVoiceOptInOverlay, {
      detail: {
        closeCallback: success => {
          resolve(success);
        },
        requireExplicitVoiceConsent,
        useVoiceUpsellV2Design
      }
    });
    window.dispatchEvent(event);
  });

export const showAvatarVideoOptInOverlay = (requireExplicitCameraConsent, useCameraU13Design) => {
  return new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.OpenCameraOptInOverlay, {
      detail: {
        closeCallback: success => {
          resolve(success);
        },
        requireExplicitCameraConsent,
        useCameraU13Design
      }
    });
    window.dispatchEvent(event);
  });
};

export const sendChatEvent = event => {
  eventStreamService.sendEventWithTarget(event.type, event.context, { ...event.params });
};
