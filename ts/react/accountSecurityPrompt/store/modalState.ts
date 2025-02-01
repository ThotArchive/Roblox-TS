enum ModalState {
  // Initial state:
  NONE = 'NONE',

  // Change password modals:
  CHANGE_PASSWORD_INTRO = 'CHANGE_PASSWORD_INTRO',
  CHANGE_PASSWORD_FORM = 'CHANGE_PASSWORD_FORM',
  CHANGE_PASSWORD_CONFIRMATION = 'CHANGE_PASSWORD_CONFIRMATION',
  CHANGE_PASSWORD_DISMISS_CONFIRMATION = 'CHANGE_PASSWORD_DISMISS_CONFIRMATION',

  // Authenticator upsell modals:
  AUTHENTICATOR_UPSELL_OPENING = 'AUTHENTICATOR_UPSELL_OPENING',
  AUTHENTICATOR_UPSELL_DOWNLOAD_APPS = 'AUTHENTICATOR_UPSELL_DOWNLOAD_APPS',

  // Account Restore Policy upsell modal:
  ACCOUNT_RESTORE_POLICY_UPSELL = 'ACCOUNT_RESTORE_POLICY_UPSELL',

  // Email 2SV Upsell modal:
  EMAIL_2SV_UPSELL = 'EMAIL_2SV_UPSELL'
}

export default ModalState;
