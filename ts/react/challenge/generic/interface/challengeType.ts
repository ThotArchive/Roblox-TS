// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/**
 * The requested challenge to render.
 */
enum ChallengeType {
  CAPTCHA = 'captcha',
  FORCE_AUTHENTICATOR = 'forceauthenticator',
  FORCE_TWO_STEP_VERIFICATION = 'forcetwostepverification',
  TWO_STEP_VERIFICATION = 'twostepverification',
  SECURITY_QUESTIONS = 'securityquestions',
  REAUTHENTICATION = 'reauthentication',
  PROOF_OF_WORK = 'proofofwork',
  ROSTILE = 'rostile',
  PRIVATE_ACCESS_TOKEN = 'privateaccesstoken',
  DEVICE_INTEGRITY = 'deviceintegrity',
  PROOF_OF_SPACE = 'proofofspace',
  PHONE_VERIFICATION = 'phoneverification',
  EMAIL_VERIFICATION = 'emailverification',
  BLOCK_SESSION = 'blocksession'
}

export default ChallengeType;
