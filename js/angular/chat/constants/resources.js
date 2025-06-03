import { CurrentUser } from 'Roblox';
import chatModule from '../chatModule';

const resources = {
  templates: {
    chatBaseTemplate: 'chat-base',
    chatBarTemplate: 'chat-bar',
    abuseReportTemplate: 'chat-abuse-report',
    dialogTemplate: 'chat-dialog',
    groupDialogTemplate: 'chat-group-dialog',
    dialogMinimizeTemplate: 'dialog-minimize',
    chatPlaceholderTemplate: 'chat-placeholder',
    confirmNegativeActionTemplate: 'confirm-negative-action',
    userConversationInfoTemplate: 'user-conversation-info',
    selectFriendsTemplate: 'select-friends',
    createChatGroupTemplate: 'create-chat-group',
    conversationTitleTemplate: 'conversation-title',
    conversationTitleEditorTemplate: 'conversation-title-editor',
    detailsTemplate: 'details',
    addFriendsTemplate: 'add-friends',
    aliasTemplate: 'alias',
    toastTemplate: 'toast',
    linkCard: 'link-card',
    gamesList: 'games-list',
    dialogHeader: 'dialog-header',
    systemMessage: 'system-message',
    chatAvatarHeadshot: 'chat-avatar-headshot',
    chatGameIcon: 'chat-game-icon',
    pendingStateTemplate: 'pending-state',
    contactCardTemplate: 'contact-card',
    osaContextCardTemplate: 'osa-context-card'
  },
  eventStreamParams: {
    actions: {
      click: 'click',
      hover: 'hover',
      render: 'render'
    },
    properties: {},
    clickPlayFromLinkCardInChat: 'clickBtnFromLinkCardInChat',
    clickLinkCardInChat: 'clickLinkCardInChat',
    clickPlayButtonInPlayTogether: 'clickPlayButtonInPlayTogether',
    clickJoinButtonInPlayTogether: 'clickJoinButtonInPlayTogether',
    clickBuyButtonInPlayTogether: 'clickBuyButtonInPlayTogether',
    clickViewDetailsButtonInPlayTogether: 'clickViewDetailsButtonInPlayTogether',
    openGameListInPlayTogether: 'openGameListInPlayTogether',
    pinGameInPlayTogether: 'pinGameInPlayTogether',
    unpinGameInPlayTogether: 'unpinGameInPlayTogether',
    pinGameInLinkCard: 'pinGameInLinkCard',
    unpinGameInLinkCard: 'unpinGameInLinkCard',
    loadGameLinkCardInChat: 'loadGameLinkCardInChat',
    gameImpressions: 'gameImpressions',
    context: {
      gamePlayFromLinkCard: 'PlayGameFromLinkCard',
      gamePlayFromPlayTogether: 'PlayGameFromPlayTogether'
    },
    pageContext: {
      linkCardInChat: 'linkCardInChat'
    }
  },
  urlParamNames: {
    startConversationWithUserId: 'startConversationWithUserId', // notfication stream
    conversationId: 'conversationId' // push notification
  },
  events: {
    openGameList: 'openGameList'
  },
  hoverPopoverParams: {
    isOpen: false,
    triggerSelector: '',
    hoverPopoverSelector: ''
  },
  performanceMeasurements: {
    messageSend: 'MessageSend',
    messageReceive: 'MessageReceive'
  },
  chatDataLSNamePrefix: CurrentUser ? `Roblox.Chat.${CurrentUser.userId}` : 'Roblox.Chat'
};

chatModule.constant('resources', resources);

export default resources;
