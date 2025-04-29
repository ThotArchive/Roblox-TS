import chatModule from '../chatModule';

const channelsNotificationType = {
    addedToChannel: 'AddedToChannel',
    channelArchived: 'ChannelArchived',
    channelCreated: 'ChannelCreated',
    channelDeleted: 'ChannelDeleted',
    channelMarkedRead: 'ChannelMarkedRead',
    channelUnarchived: 'ChannelUnarchived',
    channelUpdated: 'ChannelUpdated',
    messageCreated: 'MessageCreated',
    participantTyping: 'ParticipantTyping',
    participantsAdded: 'ParticipantsAdded',
    participantsRemoved: 'ParticipantsRemoved',
    removedFromChannel: 'RemovedFromChannel',
    systemMessageCreated: 'SystemMessageCreated',
};

chatModule.constant('channelsNotificationType', channelsNotificationType);

export default channelsNotificationType;
