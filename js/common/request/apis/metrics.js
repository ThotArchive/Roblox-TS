import { EnvironmentUrls } from 'Roblox';

import $ from 'jquery';

const URL_NOT_FOUND = 'URL_NOT_FOUND';
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountSecurityServiceUrl = `${apiGatewayUrl}/account-security-service`;

// Constants defined in the Account Security service config
export const EventCaptchaMetricName = 'event_captcha';
export const SolveTimeCaptchaMetricName = 'solve_time_captcha';
export const FunCaptchaV1 = 'V1';

export const recordMetric = metric => {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: 'POST',
      url: `${accountSecurityServiceUrl}/v1/metrics/record`,
      data: JSON.stringify(metric),
      contentType: 'application/json',
      timeout: 10000,
      success: resolve,
      error: reject,
      withCredentials: true
    });
  });
};
