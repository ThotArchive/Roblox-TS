import chatModule from '../chatModule';

function dialogAttributes(languageResource) {
  'ngInject';

  const lang = languageResource;
  const dialogBannerTypes = {
    default: -1,
    member: 0,
    game: 1
  };
  const dialogStatus = {
    INIT: 0,
    OPEN: 1,
    REPLACE: 2,
    MINIMIZE: 3,
    COLLAPSE: 4,
    REMOVE: 5,
    REFRESH: 6 // data refresh
  };
  const dialogLayoutResetConstant = {
    maxHeightOfTextInput: 16 * 5 - 8 * 2,
    maxHeightOfInput: 16 * 5, // four lines of input text
    maxHeightOfDisabledInput: 48,
    paddingOfInput: 16,
    typing: {
      isTypingAsSender: false,
      lastTimeTypingAsSender: null,
      isTypingFromSender: false,
      lastTimeReceiveTypingEvent: null,
      lastTimeReceiveTimer: null,
      userIds: [],
      userTypingDict: {}
    },
    hoverOnCollapsed: false,
    memberDisplay: {
      limitNumber: 3,
      defaultLimit: 3,
      isAll: false,
      linkName: lang.get('Label.SeeMore'),
      seeMoreLink: lang.get('Label.SeeMore'),
      seeLessLink: lang.get('Label.SeeLess'),
      toastText(friendsCount) {
        return lang.get('Message.ToastText', { friendNum: friendsCount });
      },
      timeoutToast: 5000
    },
    playTogetherButton: {
      buttonType: null,
      isPlayButtonDisabled: false
    },
    togglePopoverParams: {
      isOpen: false,
      dialogSelector: '',
      triggerSelector: '',
      dialogSelectorPrefix: '#dialog-container-',
      popoverTriggerSelectorPrefix: '#play-together-',
      pinIconClassName: 'pin-icon',
      dialogTriggerClassSelector: '',
      dialogTriggerClassPrefix: '.chat-friend-',
      isFirstTimeOpen: false
    },
    layoutId: null
  };
  const dialogTypes = {
    FRIEND: -1,
    CHAT: 0,
    GROUPCHAT: 1,
    NEWGROUPCHAT: 2,
    ADDFRIENDS: 6
  };

  return {
    activeType: {
      NEWMESSAGE: 'New message'
    },
    conversationInitStatus: {
      remove: false
    },
    conversationType: {
      oneToOneConversation: 'one_to_one',
      multiUserConversation: 'group'
    },
    dialogBannerTypes,
    dialogInitValue: {
      isUpdated: true,
      updateStatus: dialogStatus.INIT,
      markAsActive: false,
      activeType: null,
      autoOpen: false
    },
    dialogLayout: {
      lookUpMembers: false,
      focusMeEnabled: true,
      hasFocus: false,
      isFocused: false, // focus status for the entire container
      active: false,
      isChatLoading: false,
      collapsed: false,
      isConfirmationOn: false,
      isMembersOverloaded: false,
      scrollToBottom: false,
      IsdialogContainerVisible: false,
      inviteBtnDisabled: true,
      limitMemberDisplay: 6,
      heightOfInput: 32,
      maxHeightOfTextInput: dialogLayoutResetConstant.maxHeightOfTextInput,
      maxHeightOfInput: dialogLayoutResetConstant.maxHeightOfInput,
      maxHeightOfDisabledInput: dialogLayoutResetConstant.maxHeightOfDisabledInput,
      paddingOfInput: dialogLayoutResetConstant.paddingOfInput,
      limitCharacterCount: 160,
      heightOfBanner: 40,
      templateUrl: 'chat-dialog',
      scrollbarElm: null,
      listenToScrollInitialized: false,
      isBannerEnabled: false,
      renameEditor: {
        isEnabled: false,
        hasFocus: false
      },
      bannerType: dialogBannerTypes.default,
      confirmDialog: {
        isOpen: false,
        title: '',
        btnName: '',
        type: ''
      },
      typing: dialogLayoutResetConstant.typing,
      dialogContainerClass: '.dialog-container',
      hoverOnCollapsed: false,
      details: {
        isEnabled: false,
        isConversationTitleEditorEnabled: false,
        isAddFriendsEnabled: false,
        isNegativeConfirmationEnabled: false,
        friendMenuAction: {},
        friendIdForMenuOn: null
      },
      memberDisplay: dialogLayoutResetConstant.memberDisplay,
      playTogetherButton: dialogLayoutResetConstant.playTogetherButton,
      togglePopoverParams: dialogLayoutResetConstant.togglePopoverParams
    },
    dialogLayoutResetConstant,
    dialogStatus,
    dialogTypes,
    pendingStatus: {
      INVALID: 'invalid',
      PENDING: 'pending',
      NOT_PENDING: 'not_pending'
    },
    moderationType: {
      TRUSTED_COMMS: 'trusted_comms',
      MODERATED: 'moderated',
      INVALID: 'invalid',
      UNKNOWN_TYPE: 'unknown_type'
    },
    messageSenderType: {
      SYSTEM: 'system',
      USER: 'user'
    },
    negativeAction: {
      removeUser: {
        title: lang.get('Heading.RemoveUser'),
        headerTitle: lang.get('Heading.RemoveUser'),
        btnName: lang.get('Action.Remove'),
        cancelBtnName: lang.get('Action.Cancel'),
        type: 'removeUser'
      },
      leaveChatGroup: {
        title: lang.get('Heading.ConfirmLeaving'),
        headerTitle: lang.get('Heading.LeaveChatGroup'),
        btnName: lang.get('Action.Leave'),
        cancelBtnName: lang.get('Action.Stay'),
        type: 'leaveChatGroup'
      }
    },
    newGroup: {
      dialogType: dialogTypes.NEWGROUPCHAT,
      layoutId: 'newGroup',
      title: lang.get('Heading.NewChatGroup')
    },
    scrollBarTypes: {
      MESSAGE: 0,
      FRIENDSELECTION: 1
    },
    systemMessage: {
      isSystemMessage: true,
      isErrorMsg: false
    }
  };
}

chatModule.factory('dialogAttributes', dialogAttributes);

export default dialogAttributes;
