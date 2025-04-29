import chatModule from '../chatModule';

const diagActionList = {
  ChatLandingConversationClickedWeb: 'ChatLandingConversationClickedWeb',
  ConversationMessageSentWeb: 'ConversationMessageSentWeb',
  WebChatConversationsLoadedWeb: 'WebChatConversationsLoadedWeb',
  WebChatConversationRenderedWeb: 'WebChatConversationRenderedWeb',
  WebChatRenderedWeb: 'WebChatRenderedWeb'
};

chatModule.constant('diagActionList', diagActionList);

export default diagActionList;
