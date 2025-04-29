import chatModule from '../chatModule';

const notificationType = {
  newMessage: 'NewMessage',
  newMessageBySelf: 'NewMessageBySelf',
  newConversation: 'NewConversation',
  addedToConversation: 'AddedToConversation',
  removedFromConversation: 'RemovedFromConversation',
  participantAdded: 'ParticipantAdded',
  participantLeft: 'ParticipantLeft',
  friendshipDestroyed: 'FriendshipDestroyed',
  friendshipCreated: 'FriendshipCreated',
  presenceOffline: 'UserOffline',
  presenceOnline: 'UserOnline',
  conversationTitleModerated: 'ConversationTitleModerated',
  conversationTitleChanged: 'ConversationTitleChanged',
  participantTyping: 'ParticipantTyping',
  conversationUniverseChanged: 'ConversationUniverseChanged',
  userTagUpdate: 'UserTagUpdate',
  conversationBackfilled: 'ConversationBackfilled',
  conversationReset: 'ConversationReset',
  featureInterventionTypeNudge: 'nudge',
  featureInterventionTypeTimeout: 'timeout'
};

chatModule.constant('notificationType', notificationType);

export default notificationType;
