import { EnvironmentUrls } from 'Roblox';
import { eventStreamService } from 'core-roblox-utilities';
import landingPageModule from '../landingPageModule';
import events from '../constants/verifiedSignupEventStreamConstants';

function signupService(httpService, signupConstants) {
  'ngInject';

  function signup(params, signUpUrl) {
    const url = signUpUrl || EnvironmentUrls.authApi + signupConstants.urls.signUpApi;
    const urlConfig = {
      url
    };

    return httpService.httpPost(urlConfig, params, true);
  }

  // verified signup and sendSignupEvent functions are used for contact method at signup experiment
  function getVerifiedSignupChallenge(deliveryTarget) {
    const url = EnvironmentUrls.authApi + signupConstants.urls.verifiedSignupChallenge;
    const urlConfig = {
      url
    };
    const params = {
      deliveryMethod: 0,
      deliveryTarget
    };

    return httpService.httpPost(urlConfig, params, true);
  }

  function getVerifiedSignupVoucher(challenge, code) {
    const url = EnvironmentUrls.authApi + signupConstants.urls.verifiedSignupVoucher;
    const urlConfig = {
      url
    };
    const params = {
      challenge,
      code
    };

    return httpService.httpPost(urlConfig, params, true);
  }

  function verifiedSignup(params) {
    const url = EnvironmentUrls.authApi + signupConstants.urls.verifiedSignup;
    const urlConfig = {
      url
    };

    return httpService.httpPost(urlConfig, params, true);
  }

  function sendSignupEvent(event, origin) {
    eventStreamService.sendEventWithTarget(event.type, event.context, {
      ...event.params,
      origin: origin || events.DefaultVerifiedSignupOrigin
    });
  }

  return {
    signup,
    getVerifiedSignupChallenge,
    getVerifiedSignupVoucher,
    verifiedSignup,
    sendSignupEvent
  };
}

landingPageModule.factory('signupService', signupService);

export default signupService;
