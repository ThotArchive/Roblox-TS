import chatModule from '../chatModule';

const notificationsName = {
  CommunicationChannelsNotifications: 'CommunicationChannels',
  ChatMigrationNotifications: 'ChatMigration',
  ChatModerationTypeEligibilityNotifications: 'ChatModerationTypeEligibility',
  ChatNotifications: 'ChatNotifications',
  ExperienceIntervention: 'ExperienceIntervention',
  FeatureIntervention: 'FeatureIntervention',
  FriendshipNotifications: 'FriendshipNotifications',
  PresenceNotifications: 'PresenceNotifications',
  UserSettingsChangedNotifications: 'UserSettingsChanged',
  UserTagNotifications: 'UserTagChangeNotification',
  VoiceNotifications: 'VoiceNotifications'
};

chatModule.constant('notificationsName', notificationsName);

export default notificationsName;
