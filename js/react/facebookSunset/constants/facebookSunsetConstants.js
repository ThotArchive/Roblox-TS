import { EnvironmentUrls } from 'Roblox';

const facebookProvider = 'Facebook';

// setPassword endpoint requires oldPassword parameter even if no old password exists
export const oldPasswordPlaceholder = 'placeholder';

export const setPasswordUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${EnvironmentUrls.authApi}/v2/user/passwords/change`
});

export const disconnectFacebookUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${EnvironmentUrls.authApi}/v1/social/${facebookProvider}/disconnect`
});

export const passwordErrorMessages = {
  DoNotMatch: 'Response.PasswordMismatch',
  UnknownError: 'Response.ErrorTryAgain',
  Flooded: 'Response.TooManyAttemptsText',
  AccessDenied: '	Response.AccessDenied',
  InvalidPassword: 'Response.InvalidPassword'
};
