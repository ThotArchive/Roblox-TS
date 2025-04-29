import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

function libraryInitialization(languageResource) {
  'ngInject';

  const lang = languageResource;
  const chatLayout = {
    scrollbarClassName: '#chat-friend-list',
    chatContentSelector: '#chat-main',
    collapsed: true,
    pageInitializing: false,
    pageDataLoading: false,
    chatBarInitialized: false,
    isChatLoading: false,
    isFriendsLoading: false,
    widthOfChatCollapsed: 112,
    widthOfChat: 286,
    widthOfDialog: 260,
    widthOfCollapsedDialog: 160,
    spaceOfDialog: 6,
    widthOfDialogMinimize: 200,
    numberOfDialogOpen: 0,
    defaultChatZIndex: 1060,
    errorMaskEnable: false,
    isFriendListEmpty: false,
    isUserConversationEmpty: false,
    chatLandingEnabled: false,
    thresholdMobile: 543,
    thresholdChatBarOpen: 1748, // 970 + 160 * 2 + 24 * 2 + 150 + 260
    resizing: false,
    defaultTitleForMessage: lang.get('Message.DefaultTitleForMsg'),
    urlParseInitialized: false,
    noConnectionMsg: lang.get('Message.NoConnectionMsg'),
    isChatEnabledByPrivacySetting: 1,
    focusedDialogId: null,
    areDialogsUpdated: false,
    maxOpenDialogs: 12,
    conversationTitleChangedText: lang.get('Message.conversationTitleChangedText'),
    abuseReportUrl:
      '/abusereport/chat?id={userId}&redirectUrl={location}&conversationId={conversationId}'
  };
  const errors = {
    default: lang.get('Message.DefaultErrorMsg'),
    conversationTitleModerated: lang.get('Message.ConversationTitleModerated'),
    messageContentModerated: lang.get('Message.MessageContentModerated'),
    messageFilterForReceivers: lang.get('Message.MessageFilterForReceivers'),
    textTooLong: lang.get('Message.TextTooLong'),
    sendingMessagesTooQuickly: lang.get('Message.SendingMessagesTooQuickly'),
    sendMessageConflict: lang.get('Message.RefreshChat')
  };
  return {
    chatLayout,
    chatLibrary: {
      chatLayout,
      chatLayoutIds: [], // mapping chat bar position
      conversationsDict: {},
      currentTabTitle: null, // will update in controller
      dialogIdList: [],
      dialogDict: {},
      dialogScopeLib: {},
      dialogsLayout: {},
      dialogRequestedToOpenParams: {
        layoutId: null,
        autoPop: false
      },
      errors,
      friendIds: [], // current user friends id
      friendLayoutIds: [],
      friendsDict: {}, // all friend user data including my friends and my group chat friends
      currentFriendCursor: '',
      isTakeOverOn: angular.element(document.querySelector('#wrap')).data('gutter-ads-enabled'),
      layout: {
        bannerHeight: 40,
        playTogetherBannerHeight: 102,
        dialogHeight: 360,
        inputHeight: 32,
        renameEditorHeight: 32,
        searchHeight: 32,
        topBarHeight: 34,
        detailsActionHeight: 48,
        detailsInputHeight: 48
      },
      layoutIdList: [], // having all layoutIds
      minimizedDialogIdList: [],
      minimizedDialogData: {},
      userConversationsDict: {}, // used to store 1:1 conversation by userId,
      allConversationLayoutIdsDict: {},
      placesLibrary: {},
      playTogetherLibrary: {},
      layoutIdsDictPerUserId: {},
      gamesPageLink: `${EnvironmentUrls.websiteUrl}/discover`,
      isMetaDataLoaded: false,
      universeLibrary: {},
      voiceChannelMapToConversation: {},
      usePaginatedFriends: false
    },
    chatViewModel: {
      friendsDict: {},
      chatUserDict: {}
    },
    dialogLocalStorageNamePrefix: 'dialogLibrary_',
    errors,
    linksLibrary: {
      settingTabName: 'Settings',
      settingLink: '/my/account#!/privacy',
      trustedCommsLearnMoreLink: 'https://help.roblox.com/' // TXC-2293 placeholder
    }
  };
}

chatModule.factory('libraryInitialization', libraryInitialization);

export default libraryInitialization;
