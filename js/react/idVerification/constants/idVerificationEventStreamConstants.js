import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const ID_VERIFICATION = 'ageVerification';
const VOICE_CHAT = 'voiceChat';
const AVATAR_CHAT = 'avatarVideo';
const BUTTON_CLICK = 'buttonClick';

const events = {
  showQRCode: {
    name: 'showQRCode',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationQRCode'
    }
  },
  showAddEmailModal: {
    name: 'showAddEmailModal',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'addEmail'
    }
  },
  useAddEmailField: {
    name: 'useAddEmailField',
    type: eventTypes.formInteraction,
    context: ID_VERIFICATION,
    params: {
      btn: 'emailAddress',
      field: 'addEmail'
    }
  },
  addEmailConfirm: {
    name: 'addEmailConfirm',
    type: BUTTON_CLICK,
    context: ID_VERIFICATION,
    params: {
      btn: 'continue',
      field: 'addEmail'
    }
  },
  showModal: {
    name: 'showModal',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'startAgeVerification'
    }
  },
  verificationLinkClicked: {
    name: 'verificationLinkClicked',
    type: BUTTON_CLICK,
    context: ID_VERIFICATION,
    params: {
      btn: 'startSession',
      field: 'startAgeVerification'
    }
  },
  exitIdentityVerification: {
    name: 'exitIdentityVerification',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'dismissed',
      field: 'startAgeVerification'
    }
  },
  verificationInProgress: {
    name: 'verificationInProgress',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationProgress'
    }
  },
  verificationPending: {
    name: 'verificationPending',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationPending'
    }
  },
  successPage: {
    name: 'successPage',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationSucceded'
    }
  },
  successPageClose: {
    name: 'successPageClose',
    type: BUTTON_CLICK,
    context: ID_VERIFICATION,
    params: {
      btn: 'Done',
      field: 'ageVerificationSucceded'
    }
  },
  failurePage: {
    name: 'failurePage',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationFailed'
    }
  },
  failurePageClose: {
    name: 'failurePageClose',
    type: BUTTON_CLICK,
    context: ID_VERIFICATION,
    params: {
      btn: 'Done',
      field: 'ageVerificationFailed'
    }
  },
  tempBanPage: {
    name: 'tempBanPage',
    type: eventTypes.modalAction,
    context: ID_VERIFICATION,
    params: {
      aType: 'shown',
      field: 'ageVerificationTempBanned'
    }
  },
  tempBanPageClose: {
    name: 'tempBanPageClose',
    type: BUTTON_CLICK,
    context: ID_VERIFICATION,
    params: {
      btn: 'Done',
      field: 'ageVerificationTempBanned'
    }
  },
  joinWithoutVoiceChat: {
    name: 'joinWithoutVoiceChat',
    type: 'joinWithoutVoiceChat',
    context: VOICE_CHAT,
    params: {
      dontShowAgain: false
    }
  },
  closeEnableVoiceChatModal: {
    name: 'closeEnableVoiceChatModal',
    type: 'closeEnableVoiceChatModal',
    context: VOICE_CHAT
  },
  showEnableVoiceChatModal: {
    name: 'showEnableVoiceChatModal',
    type: 'showEnableVoiceChatModal',
    context: VOICE_CHAT
  },
  enableVoiceChatUpsell: {
    name: 'enableVoiceChatUpsell',
    type: 'enableVoiceChatUpsell',
    context: VOICE_CHAT
  },
  learnMoreAboutVoiceRecordingUpsell: {
    name: 'learnMoreAboutVoiceRecordingUpsell',
    type: 'learnMoreAboutVoiceRecordingUpsell',
    context: VOICE_CHAT
  },
  joinWithoutAvatarVideo: {
    name: 'joinWithoutAvatarVideo',
    type: 'joinWithoutAvatarVideo',
    context: AVATAR_CHAT
  },
  showUnifiedChatUpsellModal: {
    name: 'showUnifiedChatUpsellModal',
    type: 'showUnifiedChatUpsellModal',
    context: AVATAR_CHAT
  },
  enableAvatarVideo: {
    name: 'enableAvatarVideo',
    type: 'enableAvatarVideo',
    context: AVATAR_CHAT
  },
  learnMoreAvatarVideo: {
    name: 'learnMoreAvatarVideo',
    type: 'learnMoreAvatarVideo',
    context: AVATAR_CHAT
  }
};

export { events as default };
