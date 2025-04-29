import angular from 'angular';
import chatModule from '../chatModule';
import chat from '../chatModule';

function messageService(
  chatService,
  chatUtility,
  $rootScope,
  $filter,
  $log,
  systemMessages,
  $timeout,
  messageHelper,
  messageUtility,
  dialogAttributes,
  usersService
) {
  'ngInject';

  const oneDay = 24 * 60 * 60 * 1000;
  let partyChromeDisplayTimeStampInterval = 30000;
  function parseMessageTimestamp(message) {
    if (message.created_at && !message.parsedTimestamp) {
      message.parsedTimestamp = new Date(message.created_at).getTime();
    }
  }

  function formatTimeStamp(message, isBriefVersion, currentDate) {
    const timeStamp = message.parsedTimestamp;
    const now = angular.isDefined(currentDate) ? currentDate : new Date();
    const yesterday = new Date(now - oneDay);
    const messageDateObj = new Date(timeStamp);
    const messageDate = messageDateObj.toDateString();
    const diffDays = Math.round(Math.abs(now.getTime() - messageDateObj.getTime()) / oneDay);
    const messageDay = messageDateObj.getDay();
    const currentYear = now.getFullYear();
    const messageYear = messageDateObj.getFullYear();
    let timeFormat = 'h:mm a';
    // same day
    if (now.toDateString() === messageDate) {
      const displayTimeStamp = $filter('date')(timeStamp, timeFormat);
      if (isBriefVersion) {
        message.briefTimeStamp = displayTimeStamp;
      } else {
        message.displayTimeStamp = displayTimeStamp;
      }
    } else if (yesterday.toDateString() === messageDate) {
      // yesterday
      if (isBriefVersion) {
        message.briefTimeStamp = 'Yesterday';
      } else {
        message.displayTimeStamp = `Yesterday | ${  $filter('date')(timeStamp, timeFormat)}`;
      }
    } else if (diffDays <= messageDay) {
      // with one week
      if (isBriefVersion) {
        timeFormat = 'EEE';
        message.briefTimeStamp = $filter('date')(timeStamp, timeFormat);
      } else {
        timeFormat = `EEE | ${  timeFormat}`;
        message.displayTimeStamp = $filter('date')(timeStamp, timeFormat);
      }
    } else if (currentYear === messageYear) {
      if (isBriefVersion) {
        timeFormat = 'MMM d';
        message.briefTimeStamp = $filter('date')(timeStamp, timeFormat);
      } else {
        timeFormat = `MMM d | ${  timeFormat}`;
        message.displayTimeStamp = $filter('date')(timeStamp, timeFormat);
      }
    } else if (isBriefVersion) {
      timeFormat = 'MMM d, yyyy';
      message.briefTimeStamp = $filter('date')(timeStamp, timeFormat);
    } else {
      timeFormat = 'MMM d, yyyy | ' + timeFormat;
      message.displayTimeStamp = $filter('date')(timeStamp, timeFormat);
    }
  }

  // Use this object to mark messages read...it will queue messages so we don't send frequent calls for the same conversation
  let markMessagesRead = (function() {
    let messagesToMarkRead = {};
    let timer = false;

    function queueMessageToMarkRead(conversation) {
      messagesToMarkRead[conversation.id] = {
        conversation
      };
      if (timer === false) {
        timer = true;
        $timeout(doMarkMessagesRead, 1000);
      }
    }

    function doMarkMessagesRead() {
      for (const conversationId in messagesToMarkRead) {
        var savedData = messagesToMarkRead[conversationId];
        chatService.markAsRead(conversationId).then(
          function(_data) {
            let conversation = savedData.conversation;
            conversation.hasUnreadMessages = false;
            $rootScope.$broadcast('Roblox.Chat.LoadUnreadConversationCount');
          },
          function() {
            $log.debug('----- markAsRead request is failed ! ------');
          }
        );
      }
      messagesToMarkRead = {};
      timer = false;
    }

    return {
      queueMessageToMarkRead
    };
  })();

  function isUserInfoExisted(message, friendsDict, alienIds) {
    if (message.type !== messageHelper.messageTypes.user) {
      return false;
    }
    return (
      friendsDict &&
      !friendsDict[message.sender_user_id] &&
      alienIds.indexOf(message.sender_user_id) < 0
    );
  }

  return {
    setParams(data) {
      partyChromeDisplayTimeStampInterval = parseInt(data.partyChromeDisplayTimeStampInterval);
    },

    setFallbackClusterMaster(conversation, message, isOld) {
      if (angular.isUndefined(conversation.chatMessages)) {
        conversation.chatMessages = [];
      }
      // message is sent by different sender with previous sender
      // message is sent as different timestamp
      let index = conversation.chatMessages.length - 1;
      if (message.displayTimeStamp) {
        message.isClusterMaster = true;
      }
      if (
        conversation.chatMessages.length > 0 &&
        conversation.chatMessages[index].sender_user_id !== message.sender_user_id
      ) {
        conversation.chatMessages[index].isClusterMaster = true;
      }

      conversation.chatMessages.push(message);
    },
    setClusterMaster(conversation, message) {
      if (angular.isUndefined(conversation.chatMessages)) {
        conversation.chatMessages = [];
      }
      // message is sent by different sender with previous sender
      // message is sent as different timestamp
      if (
        (conversation.chatMessages.length > 0 &&
          conversation.chatMessages[0].sender_user_id !== message.sender_user_id) ||
        message.displayTimeStamp
      ) {
        message.isClusterMaster = true;
      }

      if (!message.resetClusterMessage) {
        conversation.chatMessages.unshift(message);
      }
    },

    buildFallbackTimeStamp(message, conversation, currentDate) {
      if (!message.created_at) {
        return false;
      }
      parseMessageTimestamp(message);
      let timeStamp = message.parsedTimestamp;
      if (
        !conversation.startTimeStamp ||
        timeStamp + partyChromeDisplayTimeStampInterval < conversation.startTimeStamp
      ) {
        formatTimeStamp(message, false, currentDate);
        conversation.startTimeStamp = timeStamp;
      }
    },

    buildTimeStamp(message, conversation, currentDate) {
      if (!message.created_at) {
        return false;
      }
      parseMessageTimestamp(message);
      let timeStamp = message.parsedTimestamp;
      if (!conversation.previousTimeStamp) {
        conversation.startTimeStamp = timeStamp;
      }
      if (
        !conversation.previousTimeStamp ||
        timeStamp - partyChromeDisplayTimeStampInterval > conversation.previousTimeStamp
      ) {
        formatTimeStamp(message, false, currentDate);
        conversation.previousTimeStamp = timeStamp;
      }
      return true;
    },

    preProcessMessages(chatLibrary, conversation, messages) {
      chatUtility.sanitizeMessages(messages);
    },

    processMessages(chatLibrary, conversation, messages, friendsDict) {
      this.preProcessMessages(chatLibrary, conversation, messages);
      this.manipulateMessages(conversation, messages, friendsDict);
    },

    // buid message dictionary and update friends dictionary
    manipulateMessages(conversation, messages, friendsDict) {
      if (!messages) {
        conversation.messagesDict = {};
      }

      if (angular.isUndefined(conversation.messagesDict)) {
        conversation.messagesDict = {};
      }

      if (messages && messages.length > 0) {
        let sizeOfMsg = messages.length;
        let alienIds = [];
        conversation.previousTimeStamp = null;
        for (var i = sizeOfMsg - 1; i >= 0; i--) {
          let message = messages[i];
          this.buildTimeStamp(message, conversation);
          if (message.type === chatUtility.messageSenderType.SYSTEM) {
            message.isSystemMessage = true;
          }
          if (!conversation.messagesDict[message.id]) {
            // chatUtility.sanitizeMessage(message);
            conversation.messagesDict[message.id] = message;
            this.setClusterMaster(conversation, message);
          }
          // check the sender user info
          if (isUserInfoExisted(message, friendsDict, alienIds)) {
            let senderId = message.sender_user_id;
            $log.debug(
              ' ----- new friend information for this message, trying to get now -----' + senderId
            );
            let userIds = [senderId];
            alienIds.push(senderId);
            usersService.getUserInfo(userIds, friendsDict);
          }
        }
        if (conversation.hasUnreadMessages) {
          $rootScope.$broadcast('Roblox.Chat.LoadUnreadConversationCount');
        }
      }
    },

    formatTimestampInConversation(conversation) {
      if (!conversation.briefTimeStamp) {
        conversation.parsedTimestamp = new Date(conversation.updated_at).getTime();
        formatTimeStamp(conversation, true);
      }
    },

    // attach message to existing conversation
    appendMessages(chatLibrary, conversation, messages) {
      if (!messages) {
        return false;
      }
      if (angular.isUndefined(conversation.messagesDict)) {
        conversation.messagesDict = {};
      }
      chatUtility.sanitizeMessages(messages);
      if (!conversation.chatMessages || conversation.chatMessages.length === 0) {
        // never have message before
        var sizeOfMsg = messages.length;
        for (var i = sizeOfMsg - 1; i >= 0; i--) {
          var message = messages[i];
          if (message.type === chatUtility.messageSenderType.SYSTEM) {
            message.isSystemMessage = true;
          }
          this.buildTimeStamp(message, conversation);
          this.setClusterMaster(conversation, message);
          if (angular.isDefined(message.id)) {
            conversation.messagesDict[message.id] = message;
          }
          if (message.sender_user_id !== chatLibrary.userId && message.is_badgeable) {
            conversation.hasUnreadMessages = true;
          }
        }
        conversation.chatMessages = messages;
      } else if (conversation.chatMessages) {
        let currentLatestMsg = {}; // set default
        for (var i = 0; i < conversation.chatMessages.length; i++) {
          let chatMessage = conversation.chatMessages[i];
          if (
            chatMessage.id &&
            !chatMessage.sendMessageHasError &&
            !chatMessage.resetClusterMessage
          ) {
            // has ID, not problem message, not sent message
            currentLatestMsg = conversation.chatMessages[i];
            parseMessageTimestamp(currentLatestMsg);
            break;
          }
        }
        var sizeOfMsg = messages.length;
        for (var i = sizeOfMsg - 1; i >= 0; i--) {
          var message = messages[i];
          if (message.type === chatUtility.messageSenderType.SYSTEM) {
            message.isSystemMessage = true;
          }
          parseMessageTimestamp(message);
          var isCurrentMessageSameAsTheLatestMessage =
            message.id === currentLatestMsg.id ||
            (currentLatestMsg.id &&
              typeof currentLatestMsg.id !== 'string' &&
              currentLatestMsg.id.toString() === message.id);
          var isMessagePresentInMessagesDict =
            !angular.isUndefined(message.id) &&
            !angular.isUndefined(conversation.messagesDict[message.id]);
          if (
            (angular.equals({}, currentLatestMsg) ||
              message.parsedTimestamp > currentLatestMsg.parsedTimestamp) &&
            !isCurrentMessageSameAsTheLatestMessage &&
            !isMessagePresentInMessagesDict
          ) {
            this.buildTimeStamp(message, conversation);
            this.setClusterMaster(conversation, message);

            conversation.messagesDict[message.id] = message;
            if (message.sender_user_id !== chatLibrary.userId && message.is_badgeable) {
              conversation.hasUnreadMessages = true;
            }
          }
        }
      }

      this.updatePreviewMessage(conversation, messages);

      if (conversation.hasUnreadMessages > 0) {
        $rootScope.$broadcast('Roblox.Chat.LoadUnreadConversationCount');
      }
    },

    markMessagesAsRead(conversation, shouldRespectConversationHasUnreadMessageToMarkAsRead) {
      if (conversation.dialogType === chatUtility.dialogType.FRIEND) {
        return;
      }
      if (
        (conversation.chatMessages || shouldRespectConversationHasUnreadMessageToMarkAsRead) &&
        conversation.hasUnreadMessages
      ) {
        markMessagesRead.queueMessageToMarkRead(conversation);
      }
    },

    buildSystemMessage(notificationType, conversation, isErrorMsg) {
      let systemMessage = angular.copy(dialogAttributes.systemMessage);
      messageUtility.setSystemMessage(systemMessage, isErrorMsg);
      switch (notificationType) {
        case chatUtility.notificationType.conversationTitleModerated:
          systemMessage.content = chatUtility.errorMessages.conversationTitleModerated;
          break;
        case chatUtility.notificationType.conversationTitleChanged:
          var conversationTitle = chatUtility.htmlEntities(conversation.name);
          systemMessage.content = $filter('formatString')(
            chatUtility.chatLayout.conversationTitleChangedText,
            { userName: conversation.actorUsername, groupName: conversationTitle }
          );
          break;
        case chatUtility.notificationType.conversationUniverseChanged:
          systemMessage.content = systemMessages.playTogether.pinGameUpdate(
            conversation.pinGame.actorUsername,
            conversation.pinGame.encodedPlaceName
          );
          break;
        case chatUtility.notificationType.presenceOnline:
          systemMessage.content = systemMessages.playTogether.playGameUpdate;
          systemMessage.hasParams = true;
          break;
      }

      if (angular.isUndefined(conversation.messages)) {
        conversation.chatMessages = [];
      }
      parseMessageTimestamp(systemMessage);
      this.setClusterMaster(conversation, systemMessage);
    },

    resetConversationUnreadStatus(conversation, messages) {
      if (messages.length === 0 && conversation.hasUnreadMessages) {
        markMessagesRead.queueMessageToMarkRead(conversation);
      }
    },

    buildPreviewMessage(message, currentDate) {
      chatUtility.sanitizeMessage(message);

      // set message.previewContent to one of the following, in order of priority:
      // 1. message.preview_content if explicitly defined by the server
      // 2. message.parsedContent if the message has been linkified
      // 3. message.content if the message has not been linkified
      message.previewContent = message.preview_content ?? message.parsedContent ?? message.content;

      // generate relative timestamp
      parseMessageTimestamp(message);
      formatTimeStamp(message, true, currentDate);

      return message;
    },


    // source of truth for preview message updates
    updatePreviewMessage(conversation, messages) {
      // conversation.previewMessage is the current assigned preview message
      // conversation.preview_message is the original server-defined preview message
      let previewMessage = conversation.previewMessage ?? conversation.preview_message;

      // if there are incoming messages, select the latest previewable message
      if (messages) {
        const latestPreviewableMessage = messages.find(message => message.is_previewable);
        if (latestPreviewableMessage) {
          // if the latest previewable message is after than the current preview message, update
          if (!previewMessage || latestPreviewableMessage.created_at > previewMessage.created_at) {
            previewMessage = latestPreviewableMessage;
          }
        }
      }

      // if we have determined a preview message and either
      // - the conversation doesn't have an assigned preview message already, or
      // - the determined preview message differs from the conversation's current assigned preview message
      // build and assign the new preview message
      if (previewMessage && (!conversation.previewMessage || previewMessage.id !== conversation.previewMessage.id)) {
        conversation.previewMessage = this.buildPreviewMessage(previewMessage);
      }
    },

    refreshTypingStatus(conversation, userIdForTyping, status, dialogLayout) {
      if (
        conversation &&
        status &&
        conversation.type === chatUtility.conversationType.multiUserConversation
      ) {
        let messages = conversation.chatMessages;
        if (messages && messages.length > 0) {
          let userTyping = dialogLayout.typing.userTypingDict[userIdForTyping];
          let clusterMessagesMarkedAsTyping = {};
          for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if (
              message.isClusterMaster &&
              message.sender_user_id === userIdForTyping &&
              (!clusterMessagesMarkedAsTyping[userIdForTyping] ||
                clusterMessagesMarkedAsTyping[userIdForTyping].messageId !== message.id)
            ) {
              userTyping.messageId = message.id;
              break;
            }
          }
        }
      }
    }
  };
}

chatModule.factory('messageService', messageService);

export default messageService;
