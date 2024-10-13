// Container IDs
export const reactLoginContainerId = 'react-login-container';
export const reactLoginPageContainer = (): HTMLElement | null =>
  document.getElementById(reactLoginContainerId);

export const landingContainerId = 'react-landing-container';
export const landingPageContainer = (): HTMLElement | null =>
  document.getElementById(landingContainerId);

export const reactRevertAccountContainerId = 'react-revert-account-container';
export const reactRevertAccountContainer = (): HTMLElement | null =>
  document.getElementById(reactRevertAccountContainerId);

export const RETURNURL = 'returnUrl';
