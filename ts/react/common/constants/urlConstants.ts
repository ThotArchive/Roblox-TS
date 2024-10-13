import { EnvironmentUrls } from 'Roblox';

// same with url constants in angular core utilities
export const urlQueryConstants = {
  urlQueryStringPrefix: '?',
  urlQueryParameterSeparator: '&',
  hashSign: '#',
  atSign: '@'
};

export const verifiedSignupUrl = {
  verifiedSignupChallenge: '/v1/verified-signup/challenge',
  verifiedSignupVoucher: '/v1/verified-signup/voucher',
  verifiedSignup: '/v1/verified-signup'
};

export const passkeyUrl = {
  startAuthentication: '/v1/passkey/StartAuthentication'
};

export const intlAuthComplianceUrl = `${EnvironmentUrls.universalAppConfigurationApi}/v1/behaviors/intl-auth-compliance/content`;
