import angular from 'angular';
import chatModule from '../chatModule';

function messageUtility($log, messageHelper, dialogAttributes) {
  'ngInject';

  return {
    isMessageTypeLegal(message) {
      let isLegal = false;
      angular.forEach(messageHelper.messageTypes, function(messageType) {
        if (messageType === message.type) {
          isLegal = true;
          return false;
        }
      });
      return isLegal;
    },

    setSystemMessage(systemMessage, isErrorMsg) {
      if (!systemMessage) {
        systemMessage = angular.copy(dialogAttributes.systemMessage);
      } else {
        angular.forEach(dialogAttributes.systemMessage, function(value, key) {
          systemMessage[key] = value;
        });
      }
      if (isErrorMsg) {
        systemMessage.isErrorMsg = true;
      }
      let now = new Date();
      systemMessage.created_at = now.toISOString();
    },

    hasUnreadMessages(conversation, messages) {
      if (!conversation.hasUnreadMessages) {
        messages.some(function(message) {
          return !message.read;
        });
      }
      return conversation.hasUnreadMessages;
    }
  };
}

chatModule.factory('messageUtility', messageUtility);

export default messageUtility;
