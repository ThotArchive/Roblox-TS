import { EnvironmentUrls, CurrentUser } from 'Roblox';
import chatModule from '../chatModule';

function chatService(
    $q,
    chatUtility,
    httpService,
    $log,
    apiParamsInitialization
) {
  'ngInject';

  const getConversations = function(conversationIds) {
    const params = {
      ids: conversationIds,
      include_messages: true,
      include_participants: true,
      include_user_data: true
    };
    return httpService.httpPost(this.apiSets.getConversationsApi, params)
        .then(function success(data) {
          convertChannels(data.conversations);
          return data.conversations;
        });
  };

  const shouldRetrieveNextMessages = function(conversation, data) {
    // first message
    if (!conversation || !conversation.chatMessages || conversation.chatMessages.length <= 0) {
      return false;
    }

    for (let messageIndex = 0; messageIndex < data.length; messageIndex++) {
      if (data[messageIndex].id === conversation.chatMessages[0].id) {
        return false;
      }
    }

    return true;
  };

  const convertChannels = function(conversations) {
    for (const conversationIndex in conversations) {
      const conversation = conversations[conversationIndex];
      const participants = conversation.participants = [];
      for (const participantIndex in conversation.participant_user_ids) {
        const participant = Object.assign({}, conversation.user_data[conversation.participant_user_ids[participantIndex]]);
        participants.push(participant);
      }
      conversation.initiator = Object.assign({}, conversation.user_data[conversation.created_by]);
      conversation.hasUnreadMessages = conversation.unread_message_count > 0;
      conversation.hasDefaultName = !conversation.name;
      conversation.conversationTitle = {
        titleForViewer: conversation.name
      };
      conversation.userPendingStatus = conversation.user_pending_status;
      conversation.participantPendingStatus = conversation.participant_pending_status;
      conversation.moderationType = conversation.moderation_type;
      conversation.osaAcknowledgementStatus = conversation.osa_acknowledgement_status;
    }
  };

  return {
    apiSets: {},

    setParams() {
      const chatDomain = EnvironmentUrls.chatApi;
      this.apiSets.markAsReadApi = {
        url: `${chatDomain}/v1/mark-conversations`,
        retryable: false,
        withCredentials: true
      };
      this.apiSets.sendMessageApi = {
        url: `${chatDomain}/v1/send-messages`,
        retryable: false,
        withCredentials: true
      };
      this.apiSets.getConversationsApi = {
        url: `${chatDomain}/v1/get-conversations`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.userConversationsApi = {
        url: `${chatDomain}/v1/get-user-conversations`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.getMessagesApi = {
        url: `${chatDomain}/v1/get-conversation-messages`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.getUnreadConversationCountApi = {
        url: `${chatDomain}/v1/get-conversation-metadata`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.getConversationsParticipantsMetadataApi = {
        url: `${chatDomain}/v1/get-conversations-participants-metadata`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.getChatModerationStatuses = {
        url: `${chatDomain}/v1/get-chat-moderation-statuses`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.startOneToOneConversationApi = {
        url: `${chatDomain}/v1/create-conversations`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.startGroupConversationApi = {
        url: `${chatDomain}/v1/create-conversations`,
        retryable: false,
        withCredentials: true
      };
      this.apiSets.addToConversationApi = {
        url: `${chatDomain}/v1/add-users`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.removeFromConversationApi = {
        url: `${chatDomain}/v1/remove-users`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.renameGroupConversationApi = {
        url: `${chatDomain}/v1/update-conversations`,
        retryable: false,
        withCredentials: true
      };
      this.apiSets.updateUserTypingStatusApi = {
        url: `${chatDomain}/v1/update-typing-status`,
        retryable: false,
        withCredentials: true
      };
      this.apiSets.recordModalSequenceResponseApi = {
        url: `${chatDomain}/v1/record-modal-sequence-response`,
        retryable: true,
        withCredentials: true
      };
      this.apiSets.uiPerformanceTrackingApi = {
        url: `${EnvironmentUrls.metricsApi}/v1/performance/send-measurement`,
        retryable: false,
        withCredentials: true
      };
    },

    getMetaData(shouldBypassCache = false) {
      const urlConfig = shouldBypassCache
        ? {
            ...apiParamsInitialization.apiSets.getMetaData,
            noCache: true
          }
        : apiParamsInitialization.apiSets.getMetaData;
      const params = {
        userId: CurrentUser?.userId ?? ''
      };
      return httpService.httpGet(urlConfig, params);
    },

    getUnreadConversationCount() {
      return httpService.httpGet(this.apiSets.getUnreadConversationCountApi, null)
          .then(function(data) {
            return { count: data.global_unread_message_count > 0 ? 1 : 0 }
          });
    },

    getUserConversations(cursor, pageSizeOfConversations, friendsDict) {
      const paramsOfConvs = {
        include_user_data: true,
        cursor,
        pageSize: pageSizeOfConversations
      };

      return httpService
          .httpGet(this.apiSets.userConversationsApi, paramsOfConvs)
          .then(function (data) {
            convertChannels(data.conversations);
            return data;
          });
    },

    getConversations,

    addToConversation(participantUserIds, conversationId) {
      const data = {
        conversation_id: conversationId,
        user_ids: participantUserIds
      };
      return httpService.httpPost(this.apiSets.addToConversationApi, data);
    },

    removeFromConversation(participantUserId, conversationId) {
      const data = {
        conversation_id: conversationId,
        user_ids: [
          participantUserId
        ]
      };
      return httpService.httpPost(this.apiSets.removeFromConversationApi, data);
    },

    startOneToOneConversation(participantUserId) {
      const data = {
        conversations: [
          {
            type: "one_to_one",
            participant_user_ids: [
              participantUserId
            ]
          }
        ],
        include_user_data: true
      };
      return httpService
          .httpPost(this.apiSets.startOneToOneConversationApi, data)
          .then(function (data) {
            convertChannels(data.conversations);
            return data.conversations[0];
          });
    },

    startGroupConversation(participantUserIds, title) {
      const data = {
        conversations: [
          {
            type: "group",
            name: title,
            participant_user_ids: participantUserIds
          }
        ],
        include_user_data: true
      };
      return httpService.httpPost(this.apiSets.startGroupConversationApi, data)
          .then(function (data) {
            convertChannels(data.conversations);
            return data.conversations[0];
          });
    },

    getMessages(conversationId, cursor) {
      // this prevents failed calls for placeholder conversations
      if (!conversationId) {
        return new Promise((resolve) => {
          return {
            messages: []
          };
        });
      }

      const params = {
        conversation_id: conversationId,
        cursor
      };

      return httpService.httpGet(this.apiSets.getMessagesApi, params);
    },

    async getAllMessages(conversationId) {
      let cursor = null;
      const messages = [];
      do {
        const params = { conversation_id: conversationId, cursor };
        const response = await httpService.httpGet(this.apiSets.getMessagesApi, params);
        messages.push(...response.messages);
        cursor = response.next_cursor;
      } while (cursor);
      return { messages };
    },

    getMessagesByPageSize(
        conversation,
        cursor,
        pageSize,
        allData,
        update,
        messageReceiveStartTime
    ) {
      const chatService = this;
      this.getMessages(conversation.id, cursor, pageSize).then(function(response) {
        const data = response.messages;
        if (data && data.length > 0) {
          const nextPageSize = pageSize * 2;
          data.forEach(function(message) {
            allData.push(message);
          });

          // repeat if all messages have not been retrieved nor reached max page size
          if (
              shouldRetrieveNextMessages(conversation, data) &&
              nextPageSize <= chatUtility.dialogParams.pageSizeOfGetMessages &&
              data.length === pageSize
          ) {
            chatService.getMessagesByPageSize(
                conversation,
                response.next_cursor,
                nextPageSize,
                allData,
                update,
                messageReceiveStartTime
            );
          } else {
            update(messageReceiveStartTime);
          }
        } else if (data && data.length === 0) {
          update(messageReceiveStartTime);
        }
      });
    },

    getConversationsParticipantsMetadata(conversationIds) {
      const params = {
        conversation_ids: conversationIds
      };
      return httpService.httpPost(this.apiSets.getConversationsParticipantsMetadataApi, params);
    },

    getChatModerationStatuses(conversationIds) {
      const params = {
        ids: conversationIds
      };
      return httpService.httpPost(this.apiSets.getChatModerationStatuses, params);
    },

    markAsRead(conversationId) {
      const data = {
        conversation_ids: [
          conversationId
        ]
      };
      return httpService.httpPost(this.apiSets.markAsReadApi, data);
    },

    sendMessage(conversationId, message) {
      const params = {
        conversation_id: conversationId,
        messages: [
          {
            content: message
          }
        ]
      };
      return httpService.httpPost(this.apiSets.sendMessageApi, params).then(function(data) {
        return { data: data.messages[0] };
      });
    },

    renameGroupConversation(conversationId, newTitle) {
      const params = {
        conversations: [
          {
            id: conversationId,
            name: newTitle
          }
        ]
      };
      return httpService
          .httpPost(this.apiSets.renameGroupConversationApi, params)
          .then(function (data) {
            return data?.conversations?.[0] ?? {};
          });
    },

    updateUserTypingStatus(conversationId, isTyping) {
      const data = {
        conversation_id: conversationId
      };
      return httpService.httpPost(this.apiSets.updateUserTypingStatusApi, data);
    },

    recordModalSequenceResponse({ conversationId, friendId, modalSequence, modalVariant, modalId, actionType }) {
      const data = {
        conversation_id: conversationId,
        friend_id: friendId,
        modal_sequence: modalSequence,
        modal_variant: modalVariant,
        modal_id: modalId,
        action_type: actionType
      };
      return httpService.httpPost(this.apiSets.recordModalSequenceResponseApi, data);
    },

    sendPerformanceData(measureName, value) {
      const data = {
        featureName: 'Chat',
        measureName,
        value
      };
      return httpService.httpPost(this.apiSets.uiPerformanceTrackingApi, data);
    }
  };
}

chatModule.factory('chatService', chatService);

export default chatService;
