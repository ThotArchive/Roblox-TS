export const pageNames = {
  EnterEmail: 'enterEmail',
  EnterCode: 'enterCode'
};

export const enterEmailStrings = {
  EmailPlaceholder: 'Label.Email',
  InvalidEmail: 'Response.InvalidEmail',
  SendCode: 'Action.SendCode'
};

export const enterCodeStrings = {
  CodePlaceholder: 'Label.SixDigitCode',
  CodeSent: 'Label.CodeSent',
  Resend: 'Action.Resend',
  Continue: 'Action.Continue',
  ChangeEmail: 'Action.ChangeEmail',
  LearnMore: 'Label.LearnMore',
  LearnMoreOneTimeCode: 'Action.LearnMoreOneTimeCode',
  EnterCodeHelp: 'Description.EnterCodeHelpV3',
  DidNotReceive: 'Action.DidntReceiveCode'
};

export const errorStrings = {
  Throttled: 'Response.TooManyAttemptsPleaseWait',
  VpnRequired: 'Response.ErrorUseCorporateNetwork',
  Unknown: 'Response.UnknownError',
  CodeInvalid: 'Response.IncorrectOtpCode'
};

export const errorCodes = {
  unknownError: 0,
  sessionTokenInvalid: 3,
  throttled: 6,
  vpnRequired: 8,
  codeInvalid: 2
};

export const statusCodes = {
  gatewayThrottle: 429
};

export const emailLengthLimit = 320;

export const contactType = 'email';

export const helpUrl = 'https://en.help.roblox.com/hc/articles/11014749736980';

export const experimentLayer = 'Website.Login';
