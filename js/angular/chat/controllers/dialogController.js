import { AbuseReportDispatcher, CurrentUser, Endpoints, EventStream } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function dialogController(
  $scope,
  $log,
  chatService,
  chatUtility,
  messageService,
  dialogAttributes,
  keyCode,
  gameService,
  resources,
  $filter,
  messageHelper,
  httpStatusCodes,
  analyticsService,
  eventNames,
  diagActionList,
  guacService
) {
  'ngInject';

  // // ----------------------------------- PRIVATE --------------------------------
  $scope.removeFromConversation = function (conversationId, layoutId) {
    chatService.removeFromConversation($scope.chatLibrary.userId, conversationId).then(function (data) {
      if (data && data.status === chatUtility.resultType.SUCCESS) {
        if (
            $scope.chatLibrary.chatLayoutIds &&
            $scope.chatLibrary.chatLayoutIds.indexOf(layoutId) > -1
        ) {
          $scope.chatLibrary.conversationsDict[conversationId].remove = true;
          $scope.closeDialog({layoutId});
        }
      }
    });
  };

  $scope.keystrokeCollectionEnabled = false; 
  $scope.isKeystrokeCollectionEnabled = function () {
    const promise = guacService.getAppPolicies();
    promise.then(guacResult => {
      if (guacResult?.EnableKeystrokeCollection === true) {
        $scope.keystrokeCollectionEnabled = true;
      }
    });
  };

  $scope.abuseReportRevampEnabled = false;
  $scope.isAbuseReportRevampEnabled = function () {
    const promise = guacService.getAbuseReportRevampPolicies();
    promise.then(guacResult => {
      if (guacResult?.EnableChat === true) {
        $scope.abuseReportRevampEnabled = true;
      }
    });
  };

  $scope.sendPerformanceData = function (message) {
    if (Math.random() < $scope.chatLibrary.relativeValueToRecordUiPerformance) {
      const { startSendingTime } = message;
      const endRespondingTime = new Date().getTime();
      const interval = endRespondingTime - startSendingTime;
      chatService.sendPerformanceData(resources.performanceMeasurements.messageSend, interval);
    }
  };

  const sendMessageInNewConversation = function (newMessage) {
    $scope
      .openConversationFromFriendId()
      .then(function (conversation) {
        const conversationId = conversation && conversation.id;
        if (!conversationId) {
          newMessage.canResend = false;
          newMessage.sendMessageHasError = true;
          newMessage.error = chatUtility.errorMessages.default;
          return;
        }

        chatService.sendMessage(conversationId, newMessage.rawContent).then(function (response) {
          $scope.sendConversationMessageSentEvent(response, false);
        });
      })
      .catch(function () {
        newMessage.canResend = false;
        newMessage.sendMessageHasError = true;
        newMessage.error = chatUtility.errorMessages.default;
      });
  };

  const sendMessage = function (newMessage, isRetry) {
    chatService.sendMessage($scope.dialogData.id, newMessage.rawContent).then(
      function (response) {
        $scope.sendConversationMessageSentEvent(response, isRetry);
        if (response) {
          const { data } = response;
          if (data) {
            newMessage.sendingMessage = false;
            newMessage.canResend = false;
            $scope.sendPerformanceData(newMessage);
            if (data.status !== chatUtility.resultType.SUCCESS) {
              newMessage.sendMessageHasError = true;
              newMessage.error = chatUtility.errorMessages.default;
              if (data.status === chatUtility.resultType.MODERATED) {
                newMessage.error = chatUtility.errorMessages.messageContentModerated;
                newMessage.content = chatUtility.hashOutContent(newMessage.content);
                chatUtility.sanitizeMessage(newMessage);
                if (newMessage.hasLinkCard) {
                  const { linkCardMessages } = newMessage;
                  linkCardMessages.forEach(function (pieceOfMessage) {
                    if (!pieceOfMessage.isCard) {
                      pieceOfMessage.content = chatUtility.hashOutContent(pieceOfMessage.content);
                    }
                  });
                }
              } else {
                newMessage.canResend = true;
              }
            } else {
              const messageFromServer = data.content;
              newMessage.sendMessageHasError = false;
              if (angular.isUndefined($scope.dialogData.messagesDict)) {
                $scope.dialogData.messagesDict = {};
              }

              newMessage.id = data.id;
              newMessage.created_at = data.created_at;
              messageService.buildTimeStamp(newMessage, $scope.dialogData);
              newMessage.resetClusterMessage = true;
              chatUtility.sanitizeMessage(data);
              newMessage.content = data.content;
              newMessage.pieces = data.pieces;
              newMessage.type = messageHelper.messageTypes.user;
              newMessage.moderation_type = data.moderation_type;
              messageService.setClusterMaster($scope.dialogData, newMessage);
              if (newMessage.hasLinkCard && newMessage.rawContent !== messageFromServer) {
                if (!data.hasLinkCard) {
                  newMessage.hasLinkCard = false;
                } else {
                  gameService.fetchDataForLinkCard([data], $scope.chatLibrary);
                  newMessage.linkCardMessages = data.linkCardMessages;
                }
              }
              $scope.dialogData.messagesDict[data.id] = newMessage;
            }
            $scope.dialogLayout.scrollToBottom = true;
          }
        }
      },
      function (errorResponse) {
        $log.debug(' ------ sendMessage error -------');
        newMessage.sendingMessage = false;
        newMessage.sendMessageHasError = true;
        newMessage.canResend = true;
        const { errors } = errorResponse;
        if (errors) {
          const { textTooLong: textTooLongCode } = chatUtility.sendMessageErrorCode;
          const {
            textTooLong: textTooLongErrorMsg,
            sendingMessagesTooQuickly: sendingMessagesTooQuicklyErrorMsg,
            sendMessageConflict: sendMessageConflictErrorMsg
          } = chatUtility.errorMessages;
          if (errors.length) {
            const { message, code } = errors[0] || {};
            if (message === textTooLongCode) {
              newMessage.error = textTooLongErrorMsg;
            } else if (code === httpStatusCodes.tooManyAttempts) {
              newMessage.error = sendingMessagesTooQuicklyErrorMsg;
            } else if (code === httpStatusCodes.conflict) {
              newMessage.canResend = false;
              newMessage.error = sendMessageConflictErrorMsg;
              $scope.sendConversationMessageSentEvent(
                {
                  data: {
                    status: 'Conflict'
                  }
                },
                isRetry
              );
            }
          }
        }
        $scope.dialogLayout.scrollToBottom = true;
      }
    );
  };

  $scope.toggleDetails = function () {
    $scope.dialogLayout.details.isEnabled = !$scope.dialogLayout.details.isEnabled;
    $scope.saveIntoDialogsLayout();
    if (!$scope.dialogLayout.details.isEnabled) {
      $scope.dialogLayout.scrollToBottom = true;
    }
  };

  $scope.dismissContactCard = function () {
    $scope.dialogLayout.shouldShowContactCard = false;
  };

  $scope.toggleConversationEditor = function () {
    $scope.dialogLayout.details.isConversationTitleEditorEnabled = !$scope.dialogLayout.details
      .isConversationTitleEditorEnabled;
    $scope.dialogLayout.focusMeEnabled =
      $scope.dialogLayout.details.isConversationTitleEditorEnabled;
    $scope.saveIntoDialogsLayout();
  };

  $scope.toggleAddFriends = function () {
    $scope.dialogLayout.details.isAddFriendsEnabled = !$scope.dialogLayout.details
      .isAddFriendsEnabled;
    if ($scope.dialogLayout.details.isAddFriendsEnabled) {
      $scope.addFriends();
    } else {
      $scope.dialogData.addMoreFriends = false;
    }
    $scope.getLimitLinkNameForMemberList();
    $scope.saveIntoDialogsLayout();
  };

  $scope.getLimitLinkNameForMemberList = function (numberOfRemove) {
    let numberOfMemebers = $scope.dialogData.userIds.length;
    if ($scope.dialogData.selectedUserIds) {
      numberOfMemebers += $scope.dialogData.selectedUserIds.length;
    }

    if (numberOfRemove) {
      numberOfMemebers -= numberOfRemove;
    }
    $scope.dialogLayout.memberDisplay.linkName = $scope.dialogLayout.memberDisplay.isAll
      ? $scope.dialogLayout.memberDisplay.seeLessLink
      : `${$scope.dialogLayout.memberDisplay.seeMoreLink} (${
          numberOfMemebers - $scope.dialogLayout.memberDisplay.defaultLimit
        })`;
  };

  $scope.toggleMemberList = function () {
    $scope.dialogLayout.memberDisplay.isAll = !$scope.dialogLayout.memberDisplay.isAll;

    $scope.dialogLayout.memberDisplay.limitNumber = $scope.dialogLayout.memberDisplay.isAll
      ? $scope.dialogData.userIds.length
      : $scope.dialogLayout.memberDisplay.defaultLimit;
    $scope.getLimitLinkNameForMemberList();
  };

  $scope.toggleFriendsMenu = function (userId, isHidden) {
    if (isHidden && $scope.dialogLayout.details.friendIdForMenuOn === userId) {
      $scope.dialogLayout.details.friendMenuAction = {};
      $scope.dialogLayout.details.friendIdForMenuOn = null;
    } else if (userId && !isHidden) {
      $scope.dialogLayout.details.friendMenuAction[userId] = !$scope.dialogLayout.details
        .friendMenuAction[userId];
      $scope.dialogLayout.details.friendIdForMenuOn = userId;
    }
  };

  $scope.updatePopoverParams = function () {
    const { id, playTogetherIds } = $scope.dialogData;
    const {
      dialogSelectorPrefix,
      popoverTriggerSelectorPrefix,
      dialogTriggerClassPrefix
    } = $scope.dialogLayout.togglePopoverParams;
    const { togglePopoverParams } = $scope.dialogLayout;
    const togglePopoverParamsUpdate = {
      dialogSelect: dialogSelectorPrefix + id,
      triggerSelector: popoverTriggerSelectorPrefix + id,
      dialogTriggerClassSelector: dialogTriggerClassPrefix + id,
      isOpen: playTogetherIds ? playTogetherIds.length > 0 : false,
      isFirstTimeOpen: true
    };
    Object.assign(togglePopoverParams, togglePopoverParamsUpdate);
  };

  // // ----------------------------------- PUBLIC ---------------------------------
  $scope.dialogParams = { ...chatUtility.dialogParams };
  $scope.userPresenceTypes = chatUtility.userPresenceTypes;
  $scope.dialogData.messageForSend = '';
  $scope.dialogLayout.scrollbarElm = chatUtility.getScrollBarSelector(
    $scope.dialogData,
    chatUtility.scrollBarType.MESSAGE
  );
  $scope.dialogLayout.listenToScrollInitialized = false;
  $scope.friendsScrollbarElm = chatUtility.getScrollBarSelector(
    $scope.dialogData,
    chatUtility.scrollBarType.FRIENDSELECTION
  );
  $scope.updatePopoverParams();
  $scope.updateDialog = function () {
    $log.debug('---- updateDialog callback ---- Scrollbars updated');
    if (!$scope.dialogLayout.IsdialogContainerVisible) {
      const scrollbarObject = angular.element($scope.dialogLayout.scrollbarElm);
      scrollbarObject.find('.mCustomScrollBox').addClass('dialog-visible');
      $scope.dialogLayout.IsdialogContainerVisible = true;
    }
    return false;
  };

  $scope.keystrokeData= [];

  $scope.buildNewMessage = function (newMessage) {
    return {
      read: true,
      content: newMessage,
      rawContent: newMessage,
      // created_at will be overwritten by the server
      created_at: new Date().toISOString(),
      // Safe to assume user messages are previewable
      is_previewable: true,
      sender_user_id: $scope.chatLibrary.userId,
      sendingMessage: true,
      sendMessageHasError: false,
      startSendingTime: new Date().getTime(),
      type: 'user'
    };
  };
  $scope.sendMessage = function () {
    if ($scope.dialogData.messageForSend.length > 0) {
      const newMessageObj = $scope.buildNewMessage($scope.dialogData.messageForSend);
      chatUtility.sanitizeMessage(newMessageObj);
      gameService.fetchDataForLinkCard([newMessageObj], $scope.chatLibrary);
      $scope.dialogData.messageForSend = '';
      if (angular.isUndefined($scope.dialogData.chatMessages)) {
        $scope.dialogData.chatMessages = [];
      }
      messageService.setClusterMaster($scope.dialogData, newMessageObj);
      messageService.updatePreviewMessage($scope.dialogData, [newMessageObj]);
      $scope.dialogLayout.scrollToBottom = true;

      if ($scope.dialogData.dialogType === chatUtility.dialogType.FRIEND) {
        sendMessageInNewConversation(newMessageObj);
      } else {
        sendMessage(newMessageObj);
      }
    }
  };

  $scope.resendMessage = function (resendMessageObj) {
    sendMessage(resendMessageObj, true);
  };

  $scope.keyPressEnter = function () {
    $scope.sendMessage();
    if ($scope.dialogLayout.typing.isTypingAsSender) {
      $scope.dialogLayout.typing.lastTimeTypingAsSender = null;
      $scope.dialogLayout.typing.isTypingAsSender = false;
    }
  };

  $scope.typing = function ($event, isTyping, currentDate) {
    if ($scope.dialogData.dialogType === chatUtility.dialogType.FRIEND) {
      return;
    }

    if (isTyping) {
      if ($event.which !== keyCode.enter) {
        const now = currentDate || new Date().getTime();
        const typingStatus = $scope.dialogLayout.typing;

        if (
          !typingStatus.lastTimeTypingAsSender ||
          now - typingStatus.lastTimeTypingAsSender >
            $scope.chatLibrary.typingInChatAsSenderThrottleMs
        ) {
          typingStatus.lastTimeTypingAsSender = now;
          typingStatus.isTypingAsSender = true;
          chatService.updateUserTypingStatus($scope.dialogData.id, true);
        }
      }

      $scope.toggleDialogFocusStatus(true);
    }
  };

  $scope.abuseReport = function (userId, isConfirmed) {
    $scope.dialogLayout.isAbuseReportConfirmationOn = true;
    // remember userId for the confirmation
    if (userId) {
      $scope.dialogLayout.userIdForAbuseReport = userId;
    }
    if (isConfirmed && $scope.dialogLayout.userIdForAbuseReport) {
      if ($scope.abuseReportRevampEnabled) {
        const params = new URLSearchParams({
          targetId: $scope.dialogData.id,
          submitterId: CurrentUser.userId,
          abuseVector: 'chat'
        });
        const url = `/report-abuse/?${params.toString()}`;
        window.location.href = url;
        return;
      }

      const relativeUrl = $filter('formatString')(chatUtility.chatLayout.abuseReportUrl, {
        userId: $scope.dialogLayout.userIdForAbuseReport,
        location: escape(window.location),
        conversationId: $scope.dialogData.id
      });
      const url = Endpoints ? Endpoints.getAbsoluteUrl(relativeUrl) : relativeUrl;

      if (AbuseReportDispatcher) {
        AbuseReportDispatcher.triggerUrlAction(url);
      } else {
        window.location.href = url;
      }

      $scope.dialogLayout.userIdForAbuseReport = null;
      $scope.dialogLayout.isAbuseReportConfirmationOn = false;
    }
    $scope.saveIntoDialogsLayout();
  };

  $scope.keyStroke = function ($event, userId) {
    if (!$scope.keystrokeCollectionEnabled) {
      return;
    }
    if (chatUtility.dialogParams.keystrokeSampleRate == 0) {
      return;
    }
    const N = Math.round(1 / chatUtility.dialogParams.keystrokeSampleRate);
    if ((parseInt(userId) % N) != 0) {
      return;
    }
    const now =  new Date().getTime();
    if ($event.type != 'keyup' && $event.type != 'keydown') {
      return;
    }
    const eventType = $event.type == 'keyup' ? 1 : 0;
    const key = $event.key;

    const keystrokeEvent = { key, eventType, timestamp: now };
    $scope.keystrokeData.push(keystrokeEvent);

    if (key == 'Enter' && eventType == 1) {
      const { keyPressedData, eventTypeData, timestampData } = splitKeystrokeData($scope.keystrokeData);
      EventStream.SendEventWithTarget(
        'appChatKeyStrokes',
        'enterPressed',
        {
          keyPressedData: JSON.stringify(keyPressedData),
          eventTypeData: JSON.stringify(eventTypeData),
          timestampData: JSON.stringify(timestampData)
        },
        EventStream.TargetTypes.WWW
      );
      $scope.keystrokeData = [];
    }
    else if ($scope.keystrokeData.length >= chatUtility.dialogParams.maxKeystrokeDataLength) {
      const { keyPressedData, eventTypeData, timestampData } = splitKeystrokeData($scope.keystrokeData);
      EventStream.SendEventWithTarget(
        'appChatKeyStrokes',
        'maxLengthReached',
        {
          keyPressedData: JSON.stringify(keyPressedData),
          eventTypeData: JSON.stringify(eventTypeData),
          timestampData: JSON.stringify(timestampData)
        },
        EventStream.TargetTypes.WWW
      );
      $scope.keystrokeData = [];
   }
  };

  function splitKeystrokeData(data) {
      const keyPressedData = [];
      const eventTypeData = [];
      const timestampData = [];

      data.forEach(event => {
          keyPressedData.push(event.key);
          eventTypeData.push(event.eventType);
          timestampData.push(event.timestamp);
      });

      return { keyPressedData, eventTypeData, timestampData };
  }
  $scope.leaveGroupChat = function (isConfirmed) {
    if (isConfirmed) {
      $scope.chatLibrary.conversationsDict[$scope.dialogData.id].remove = true;
      $scope.removeFromConversation($scope.dialogData.id, $scope.dialogData.layoutId);
      $scope.resetConfirmDialog();
    } else {
      $scope.dialogLayout.confirmDialog.isOpen = true;
      const leaveChatGroupData = dialogAttributes.negativeAction.leaveChatGroup;
      $scope.dialogLayout.confirmDialog.title = leaveChatGroupData.title;
      $scope.dialogLayout.confirmDialog.headerTitle = leaveChatGroupData.headerTitle;
      $scope.dialogLayout.confirmDialog.btnName = leaveChatGroupData.btnName;
      $scope.dialogLayout.confirmDialog.cancelBtnName = leaveChatGroupData.cancelBtnName;
      $scope.dialogLayout.confirmDialog.type = leaveChatGroupData.type;
    }
  };

  $scope.openLearnMorePage = function () {
    window.open(chatUtility.linksLibrary.trustedCommsLearnMoreLink, '_blank');
  };

  $scope.addFriends = function () {
    $scope.dialogData.addMoreFriends = true;
    if ($scope.chatLibrary.friendIds.length > 0) {
      $scope.updateFriends();
    }
    $scope.dialogData.scrollBarType = chatUtility.scrollBarType.FRIENDSELECTION;
  };

  $scope.viewParticipants = function () {
    $scope.dialogLayout.lookUpMembers = !$scope.dialogLayout.lookUpMembers;
  };

  $scope.toggleGroupNameEditor = function () {
    $scope.dialogLayout.renameEditor.isEnabled = !$scope.dialogLayout.renameEditor.isEnabled;
    $scope.dialogLayout.renameEditor.hasFocus = !$scope.dialogLayout.renameEditor.hasFocus;

    $scope.updateDialogStyle();
    $scope.dialogLayout.focusMeEnabled = !$scope.dialogLayout.renameEditor.isEnabled;
  };

  $scope.renameTitle = function () {
    const legacyTitle = $scope.dialogData.title;
    chatService
      .renameGroupConversation($scope.dialogData.id, $scope.dialogData.name)
      .then(function (data) {
        if (data) {
          switch (data.status) {
            case chatUtility.resultType.MODERATED:
              messageService.buildSystemMessage(
                chatUtility.notificationType.conversationTitleModerated,
                $scope.dialogData,
                true
              );
              chatUtility.updateConversationTitle($scope.dialogData, legacyTitle);
              break;
            case chatUtility.resultType.SUCCESS:
              chatUtility.updateConversationTitle($scope.dialogData, data.name);
              break;
          }
          $scope.toggleConversationEditor();
        }
      });
  };

  $scope.removeMember = function (id, isConfirmed) {
    if (isConfirmed) {
      $scope.resetConfirmDialog();
      $scope.getLimitLinkNameForMemberList(1);
      chatService.removeFromConversation(id, $scope.dialogData.id).then(function () {
        if (data && data.status === chatUtility.resultType.SUCCESS) {
          $scope.isOverLoaded();
        }
      });
    } else {
      $scope.dialogLayout.confirmDialog.isOpen = true;
      const removeUserData = dialogAttributes.negativeAction.removeUser;
      $scope.dialogLayout.confirmDialog.title = removeUserData.title;
      $scope.dialogLayout.confirmDialog.headerTitle = removeUserData.headerTitle;
      $scope.dialogLayout.confirmDialog.btnName = removeUserData.btnName;
      $scope.dialogLayout.confirmDialog.cancelBtnName = removeUserData.cancelBtnName;
      $scope.dialogLayout.confirmDialog.type = removeUserData.type;
      $scope.dialogLayout.confirmDialog.params = { userId: id };
    }
  };

  $scope.resetConfirmDialog = function () {
    const resetParams = {
      isOpen: false,
      title: '',
      btnName: '',
      type: '',
      params: {}
    };
    Object.assign($scope.dialogLayout.confirmDialog, resetParams);
  };

  $scope.confirmCallBack = function () {
    const { confirmDialog } = $scope.dialogLayout;
    switch (confirmDialog.type) {
      case dialogAttributes.negativeAction.removeUser.type:
        $scope.removeMember(confirmDialog.params.userId, true);
        break;
      case dialogAttributes.negativeAction.leaveChatGroup.type:
        $scope.leaveGroupChat(true);
        break;
    }
  };

  $scope.updateDialogHeader = function (isHovered) {
    if ($scope.dialogLayout.collapsed) {
      $scope.dialogLayout.hoverOnCollapsed = isHovered;
    }
  };

  $scope.getOneToOneFriendId = function () {
    if ($scope.dialogData.type !== chatUtility.conversationType.oneToOneConversation) {
      return 0;
    }

    return $scope.dialogData.userIds[0];
  };

  $scope.sendConversationMessageSentEvent = function(sendMessageResponse, isRetry) {
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }

      let messageSentResult;
      if (!sendMessageResponse) {
        messageSentResult = 'NoResponse';
      } else if (!sendMessageResponse.data) {
        messageSentResult = 'NoResponseBody';
      } else if (!sendMessageResponse.data.status) {
        messageSentResult = 'NoMessageStatus';
      } else {
        messageSentResult = sendMessageResponse.data.status;
      }

      const messageId = sendMessageResponse?.data?.id;
      const recipientIds = JSON.stringify($scope.dialogData?.candidatePlayerIds || []);

      const extraProperties = {
        messageId,
        messageSentResult,
        recipientIds,
        isRetry: isRetry || false
      };

      $scope.sendConversationEvent(
        eventNames.conversationMessageSent,
        diagActionList.ConversationMessageSentWeb,
        extraProperties
      );
    } catch (e) {
      $log.debug(`sendConversationMessageSentEvent failed: ${e}`);
    }
  };

  $scope.sendConversationEvent = function (eventName, counterName, extraProperties) {
    const conversationId = analyticsService.getConversationIdForAnalytics($scope.dialogData);
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }
      analyticsService.incrementCounter(counterName);

      const eventProperties = {
        localTimestamp: Date.now(),
        conversationId,
        ...extraProperties
      };

      analyticsService.sendEvent(eventName, eventProperties);
    } catch (e) {
      $log.debug(
        `sendConversationEvent for Event ${eventName} and Conversation ${conversationId} failed: ${e}`
      );
    }
  };

  $scope.sendWebChatConversationRenderedEvent = function () {
    const conversationId = analyticsService.getConversationIdForAnalytics($scope.dialogData);
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }
      analyticsService.incrementCounter(diagActionList.WebChatConversationRenderedWeb);

      const eventProperties = {
        localTimestamp: Date.now(),
        conversationId,
        isDialogOpen: !$scope.dialogLayout?.collapsed,
        conversationSource: $scope.dialogData?.source,
        moderationType: $scope.dialogData?.moderationType,
        userPendingStatus: $scope.dialogData?.userPendingStatus
      };

      analyticsService.sendEvent(eventNames.webChatConversationRendered, eventProperties);
    } catch (e) {
      $log.debug(
        `sendWebChatConversationRenderedEvent for Conversation ${conversationId} failed: ${e}`
      );
    }
  };

  const updateCurrentDialogScreen = () => {
    if ($scope.dialogLayout.isAbuseReportConfirmationOn === true) {
      $scope.dialogLayout.currentDialogScreen = 'abuseReportConfirmation';
    } else if (
      $scope.dialogLayout.confirmDialog.isOpen === true &&
      $scope.dialogData.type === chatUtility.conversationType.multiUserConversation
    ) {
      $scope.dialogLayout.currentDialogScreen = 'confirmDialog';
    } else if ($scope.dialogLayout.details.isEnabled === true) {
      $scope.dialogLayout.currentDialogScreen = 'details';
    } else if (
      $scope.dialogData.isUserPending === true &&
      $scope.dialogData.type === chatUtility.conversationType.multiUserConversation
    ) {
      $scope.dialogLayout.currentDialogScreen = 'pending';
    } else if (
      $scope.chatLibrary.isWebChatTcEnabled &&
      $scope.dialogLayout.shouldShowContactCard === true &&
      $scope.dialogData.type === chatUtility.conversationType.oneToOneConversation
    ) {
      $scope.dialogLayout.currentDialogScreen = 'contactCard';
    } else {
      $scope.dialogLayout.currentDialogScreen = 'default';
    }
  };

  $scope.updateShouldShowOsaContextCard = function () {
    // show the OSA context card if:
    $scope.dialogLayout.shouldShowOsaContextCard =
      // 1. the GUAC setting is enabled
      $scope.chatLibrary.useOneToOneOsaContextCards === true &&
      // 2. either
      //    a. it's a friend placeholder
      //    b. it's a channels conversation and there are no more messages to be loaded
      (
        $scope.dialogData.source === chatUtility.conversationSource.FRIENDS ||
        (
          !$scope.dialogParams.loadMoreMessages ||
          (
            $scope.dialogData.chatMessages &&
            $scope.dialogData.chatMessages.length > 0 &&
            $scope.dialogData.chatMessages.length < $scope.dialogParams.pageSizeOfGetMessages
          )
        )
      ) &&
      // 3. the OSA acknowledgement status is "unacknowledged" or "acknowledged"
      (
        $scope.dialogData.osaAcknowledgementStatus === dialogAttributes.osaAcknowledgementStatus.UNACKNOWLEDGED ||
        $scope.dialogData.osaAcknowledgementStatus === dialogAttributes.osaAcknowledgementStatus.ACKNOWLEDGED
      );
  };

  // // ----------------------------------- CODE TO RUN --------------------------------
  $scope.dialogLayout.currentDialogScreen = 'default';
  $scope.dialogLayout.shouldShowContactCard = false;
  $scope.$watchGroup(
    [
      'dialogLayout.isAbuseReportConfirmationOn',
      'dialogLayout.confirmDialog.isOpen',
      'dialogLayout.details.isEnabled',
      'dialogData.isUserPending',
      'dialogData.type',
      'dialogLayout.shouldShowContactCard'
    ],
    () => {
      updateCurrentDialogScreen();
    }
  );

  $scope.$watchGroup(
    [
      'chatLibrary.useOneToOneOsaContextCards',
      'dialogData.osaAcknowledgementStatus',
      'dialogData.chatMessages',
      'dialogParams.loadMoreMessages'
    ],
    function() {
      $scope.updateShouldShowOsaContextCard();
    }
  );

  if (
    $scope.dialogData.dialogType !== chatUtility.dialogType.FRIEND &&
    !$scope.dialogData.isUserPending
  ) {
    const shouldScrollFromTop = chatUtility.shouldScrollFromTop($scope.dialogData, $scope.chatLibrary);
    const messagesTask = shouldScrollFromTop
      ? chatService.getAllMessages($scope.dialogData.id)
      : chatService.getMessages(
          $scope.dialogData.id,
          null,
          $scope.dialogParams.pageSizeOfGetMessages
        );
    if (angular.isUndefined($scope.dialogData.messagesDict)) {
      $scope.dialogLayout.isChatLoading = true;
    }
    messagesTask.then(function (response) {
        const data = response.messages;
        $scope.dialogLayout.isChatLoading = false;
        if (data) {
          $scope.dialogParams.getMessagesNextCursor = response.next_cursor;
          $scope.dialogData.chatMessages = [];
          $scope.dialogData.messagesDict = {};
          messageService.processMessages(
            $scope.chatLibrary,
            $scope.dialogData,
            data,
            $scope.chatLibrary.friendsDict
          );
          gameService.fetchDataForLinkCard(data, $scope.chatLibrary);
          $scope.dialogData.scrollBarType = chatUtility.scrollBarType.MESSAGE;
          if (!response.next_cursor) {
            $scope.dialogParams.loadMoreMessages = false;
          }
          if (shouldScrollFromTop) {
            $scope.updateDialog();
            $scope.$apply();
          }
        } else {
          $scope.dialogData.scrollBarType = chatUtility.scrollBarType.MESSAGE;
          $scope.updateDialog();
        }
      });
  }

  $scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
    $log.debug(`---- oldHeight -----${oldHeight}---- newHeight -----${newHeight}`);
    if (oldHeight !== newHeight) {
      event.preventDefault();
      event.stopPropagation();
      chatUtility.setResizeInputLayout(
        $scope.chatLibrary,
        newHeight,
        $scope.dialogData,
        $scope.dialogLayout
      );
    }
  });

  if ($scope.dialogData.isConversationUnavailableWithUser) {
    chatUtility.setResizeInputLayout(
      $scope.chatLibrary,
      dialogAttributes.dialogLayout.maxHeightOfDisabledInput,
      $scope.dialogData,
      $scope.dialogLayout
    );
  }

  $scope.init = function () {
    $scope.getLimitLinkNameForMemberList();
    $scope.sendWebChatConversationRenderedEvent();
    $scope.isKeystrokeCollectionEnabled();
    $scope.isAbuseReportRevampEnabled();
  };

  $scope.init();
}

chatModule.controller('dialogController', dialogController);

export default dialogController;
