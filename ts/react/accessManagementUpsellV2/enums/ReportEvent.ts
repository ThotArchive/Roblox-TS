export enum ReportEvent {
  VerificationStarted = 'VERIFICATION_STARTED',
  verificationInProgress = 'VERIFICATION_IN_PROGRESS',
  VerificationPending = 'VERIFICATION_PENDING',
  VerificationFailed = 'VERIFICATION_FAILED',
  VerificationSucceded = 'VERIFICATION_SUCCEEDED',
  AMPCheckFailed = 'AMP_CHECK_FAILED',
  EmailUpdateFailed = 'EMAIL_UPDATE_FAILED'
}
export default ReportEvent;
