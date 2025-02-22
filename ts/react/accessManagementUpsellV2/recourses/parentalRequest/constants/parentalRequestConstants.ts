import { EnvironmentUrls } from 'Roblox';

const parentalRequestConstants = {
  privacyPolicyUrl: `${EnvironmentUrls.websiteUrl}/info/privacy`,
  chargebackWizardSessionTokenLocalStorageKey: 'Roblox.ChargebackWizardSessionToken',
  defaultCooldownTimeInMs: 900000, // 15 minutes,
  emailRegex: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
  isChildSubjectToPCFeatureName: 'IsChildSubjectToParentalControls',
  translationKeys: {
    gatherParentEmail: {
      title: 'Title.EnterParentEmailV2',
      permissionNeededTitle: 'Title.PermissionNeeded',
      askYourParentTitle: 'Title.AskYourParent',
      body: 'Description.EnterParentEmailV4',
      combinedBody: 'Description.EnterParentEmailExp',
      bodyWithoutPC: 'Description.EnterParentEmailWithoutParentalControl',
      combinedBodyWithoutPC: 'Description.EnterParentEmailExpWithoutParentalControl',
      footer: 'Description.ParentalEmailFooter',
      unknownError: 'Message.SomethingWentWrong',
      invalidEmailError: 'Message.InvalidEmail',
      btnText: 'Action.SendEmail',
      emailPlaceholder: 'Label.EmailCapitalized',
      parentEmailLabel: 'Label.ParentEmail',
      emailTooManyChildrenError: 'Message.EmailIneligible',
      childTooManyParentsError: 'Message.ExistAccountWithEmail',
      emailTooManyRequest: 'Message.TooManyAttempts',
      senderFlooded: 'Message.TooManyAttemptAskParent',
      alreadyApplied: 'Description.AllSet',
      seeRequestAfterLink: 'Message.RequestCreatedEmailNotSent',
      alreadyLinked: 'Message.AlreadyLinked'
    },
    emailSentConfirmation: {
      title: 'Title.RequestSent',
      oneParentBody: 'Message.EmailSent',
      pluralParentBody: 'Message.EmailSentPluralParent',
      emailNotSentBody: 'Message.RequestCreatedEmailNotSent',
      btnText: 'Action.OK'
    },
    exitWarning: {
      title: 'Title.AreYouSure',
      body: 'Description.ExitEnterEmail',
      actionBtnText: 'Action.EnterEmail',
      neutralBtnText: 'Action.Cancel'
    }
  },
  events: {
    chargebackContext: {
      parentalEntry: 'parentalEntry',
      settingsAge: 'settingsAgeChargeback',
      settingsRequestSent: 'settingsChargebackRequestSent'
    },
    savePaymentMethodsContext: {
      parentalEntry: 'parentalEntryDevsubs',
      settingsAge: 'settingsAgeSavePaymentMethods',
      settingsRequestSent: 'settingsSavePaymentMethodsRequestSent'
    },
    changeBirthdayContext: {
      parentalEntry: 'parentalEntryAgeChange',
      settingsAge: 'settingsAgeChangeBirthday',
      settingsRequestSent: 'settingsAgeChangeVerifyRequestSent'
    },
    updateUserSettingContext: {
      parentalEntry: 'parentalEntrySettings',
      settingsAge: 'settingsAgeSettings',
      settingsRequestSent: 'settingsRequestSent'
    },
    eventName: {
      authPageLoad: 'authPageload',
      authButtonClick: 'authButtonClick',
      authFormInteraction: 'authFormInteraction',
      authMsgShown: 'authMsgShown',
      authModalShown: 'authModalShown'
    },
    state: {
      sessionId: 'sessionId',
      unknown: 'unknown',
      changeBirthday: {
        U13To18: 'U13To18',
        U13To1318: 'U13To1318',
        U13ToU13: 'U13ToU13'
      }
    },
    field: {
      email: 'email',
      errorMessage: 'errorMessage',
      logoutPopup: 'logoutPopup',
      parentalEmailMismatch: 'parentalEmailMismatch'
    },
    btn: {
      verifyCancel: 'verifyCancel',
      continue: 'continue',
      submit: 'submit'
    },
    text: {
      enterParentEmail: "Enter Parent's Email",
      sendEmail: 'Send Email',
      submit: 'Submit',
      ok: 'OK',
      requestSent: 'Request Sent'
    }
  },
  settingName: {
    enablePurchases: 'enablePurchases'
  }
};

export default parentalRequestConstants;
