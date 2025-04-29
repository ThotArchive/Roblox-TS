import { VerificationStatusCode, VerificationViewState } from '../../../enums';
import { PageText } from '../verificationSlice';

export const VerificationChecklistStep = [
  { label: 'Label.ConnectingToMobile', statusCode: [VerificationStatusCode.Unknown] },
  { label: 'Label.VerifyingYou', statusCode: [VerificationStatusCode.Started] },
  {
    label: 'Label.VerificationWaitingForResults',
    statusCode: [VerificationStatusCode.Submitted]
  },
  {
    label: 'Label.UpdatingRoblox',
    statusCode: [VerificationStatusCode.Success, VerificationStatusCode.Stored]
  }
];

export const getPageStateConstants = (page: VerificationViewState, bodyTextList: string[] = []) => {
  let pageState: PageText = {
    heading: 'Heading.VerificationSuccessful',
    icon: 'success-icon',
    bodyText: ['Label.DateOfBirthUpdated'],
    buttonText: 'Action.Close',
    footerText: null
  };
  switch (page) {
    case VerificationViewState.SUCCESS_GENERIC:
      // default pageState
      break;
    case VerificationViewState.FAILURE:
      pageState = {
        ...pageState,
        heading: 'Heading.VerificationFailed',
        icon: 'failure-icon',
        bodyText: ['Label.FailedVerification'],
        buttonText: 'Action.Close'
      };
      break;
    case VerificationViewState.PENDING:
      pageState = {
        ...pageState,
        heading: 'Heading.VerificationPending',
        icon: 'failure-icon',
        bodyText: ['Label.PendingVerification'],
        buttonText: 'Action.Close'
      };
      break;
    case VerificationViewState.ERROR:
      pageState = {
        ...pageState,
        heading: 'Heading.Error',
        icon: 'failure-icon',
        bodyText: ['Label.GenericError']
      };
      break;
    case VerificationViewState.TEMP_BAN:
      pageState = {
        ...pageState,
        heading: 'Heading.Error',
        icon: 'failure-icon',
        bodyText: ['Label.VerificationDeclined']
      };
      break;
    case VerificationViewState.LANDING:
    case VerificationViewState.EMAIL:
    case VerificationViewState.MODAL:
    case VerificationViewState.POLLING:
    case VerificationViewState.EMAIL_CONTINUE:
    case VerificationViewState.EXTERNAL_EMAIL:
    case VerificationViewState.VENDOR_LINK:
    default:
      break;
  }
  pageState.bodyText = [...pageState.bodyText, ...bodyTextList];
  return pageState;
};

export const ActionConstants = {
  RestartSession: 'Action.RestartSession',
  StartSession: 'Action.StartSession'
};

export const LabelConstants = {
  HavingTroubleScanCode: 'Label.HavingTroubleScanCode',
  PleaseDoNotClose: 'Label.PleaseDoNotClose',
  VerificationDataSubmitted: 'Label.VerificationDataSubmitted',
  VerifyInBrowser: 'Label.VerifyInBrowser',
  AgeVerifyPrompt: 'Label.AgeVerifyPrompt',
  PrepareId: 'Label.PrepareId',
  ValidIdList: 'Label.ValidIdList',
  UseSmartphone: 'Label.UseSmartphone',
  SmartphoneRequired: 'Label.SmartphoneRequired',
  ScanQRCode: 'Label.ScanQRCode',
  PrivacyNoticeAndLink: 'Label.PrivacyNoticeAndLink'
};
