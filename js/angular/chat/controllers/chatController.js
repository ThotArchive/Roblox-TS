import { RealTime, EnvironmentUrls, CurrentUser, DisplayNames } from 'Roblox';
import { UserProfileField } from 'roblox-user-profiles';
import angular from 'angular';
import chatModule from '../chatModule';

function chatController(
  $scope,
  $window,
  $document,
  $timeout,
  $interval,
  $log,
  chatService,
  messageService,
  chatUtility,
  chatClientStorageUtilityService,
  localStorageService,
  performanceService,
  messageUtility,
  googleAnalyticsEventsService,
  urlService,
  dialogAttributes,
  libraryInitialization,
  gameService,
  playTogetherService,
  pinGameService,
  presenceLayout,
  resources,
  storageService,
  usersService,
  conversationsUtility,
  contactsService,
  thumbnailConstants,
  usersPresenceService,
  userProfilesService,
  analyticsService,
  eventNames,
  diagActionList,
  guacService
) {
  'ngInject';

  // // ----------------------------------- PRIVATE --------------------------------

  const refreshDialog = function (layoutId) {
    if ($scope.chatLibrary.dialogDict[layoutId]) {
      $scope.chatLibrary.dialogDict[layoutId].isUpdated = true;
      $scope.chatLibrary.dialogDict[layoutId].updateStatus = chatUtility.dialogStatus.REFRESH;
    }
  };

  const getDialogsNumber = function () {
    const widthOfWindow = $document.innerWidth();
    const availableWidthOfDialogs =
      widthOfWindow -
      chatUtility.chatLayout.widthOfChat -
      chatUtility.chatLayout.widthOfDialogMinimize;
    const widthOfDialog =
      chatUtility.chatLayout.widthOfDialog + chatUtility.chatLayout.spaceOfDialog;

    $scope.chatLibrary.chatLayout.availableNumberOfDialogs = Math.floor(
      availableWidthOfDialogs / widthOfDialog
    );
    $scope.chatLibrary.chatLayout.numberOfDialogs = $scope.chatLibrary.dialogIdList.length;
    $scope.chatLibrary.chatLayout.numberOfMinimizedDialogs =
      $scope.chatLibrary.minimizedDialogIdList.length;
    $log.debug(
      ` -------------numberOfDialogs = -------------- ${$scope.chatLibrary.chatLayout.numberOfDialogs}`
    );
    $log.debug(
      ` -------------availableNumberOfDialogs = -------------- ${$scope.chatLibrary.chatLayout.availableNumberOfDialogs}`
    );
  };

  const dialogsFitWindow = function () {
    const widthOfWindow = $document.innerWidth();
    return (
      $scope.chatLibrary.chatLayout.numberOfDialogs <
        $scope.chatLibrary.chatLayout.availableNumberOfDialogs &&
      widthOfWindow > chatUtility.chatLayout.thresholdMobile
    );
  };

  const markActiveForDialog = function (layoutId, activeType) {
    if ($scope.chatLibrary.dialogDict[layoutId]) {
      $scope.chatLibrary.dialogDict[layoutId].markAsActive = true;
      $scope.chatLibrary.dialogDict[layoutId].activeType = activeType;
    }
  };

  const notifyUser = function (conversation) {
    // existing dialog, just refresh data
    if ($scope.chatLibrary.dialogDict[conversation.layoutId]) {
      refreshDialog(conversation.layoutId);
    }
    // populate new dialog
    if (
      !$scope.chatLibrary.dialogDict[conversation.layoutId] &&
      conversation.displayMessage &&
      conversation.displayMessage.content
    ) {
      $scope.launchDialog(conversation.layoutId, true);
    }
  };

  $scope.dialogsOverflowWindow = function () {
    const widthOfWindow = $document.innerWidth();
    return (
      $scope.chatLibrary.chatLayout.numberOfDialogs >=
        $scope.chatLibrary.chatLayout.availableNumberOfDialogs &&
      widthOfWindow > chatUtility.chatLayout.thresholdMobile
    );
  };


  $scope.processLatestMessageForConversations = function (data) {
    angular.forEach(data, function (messageData) {
      const messages = messageData.messages;
      const message = messages.length > 0 ? messages[0] : {};
      if ($scope.chatLibrary.conversationsDict[messageData.conversationId]) {
        const { layoutId } = $scope.chatLibrary.conversationsDict[messageData.conversationId];
        const conversation = $scope.chatUserDict[layoutId];
        conversation.hasUnreadMessages =
          conversation.hasUnreadMessages ||
          messageUtility.hasUnreadMessages(conversation, messages);
        chatUtility.sanitizeMessage(message);
        conversation.displayMessage = messageService.buildDisplayMessage(message);
        messageService.resetConversationUnreadStatus($scope.chatUserDict[layoutId], messages);
        messageService.formatTimestampInConversation($scope.chatUserDict[layoutId]);
      }
    });
  };

  $scope.updateUnreadConversationCount = function () {
    if ($scope.getIsChatEnabled()) {
      chatService.getUnreadConversationCount().then(
        function (data) {
          if (data) {
            const { count } = data;
            if (count > 0) {
              $scope.chatViewModel.unreadConversationCount = ' ✦ ';
              $window.document.title = `( ✦ ) ${$scope.chatLibrary.currentTabTitle}`;
            } else {
              $scope.chatViewModel.unreadConversationCount = 0;
              $window.document.title = $scope.chatLibrary.currentTabTitle;
            }
          }
        },
        function () {
          $log.debug('----- getUnreadConversationCount request is failed ! ------');
          $window.document.title = $scope.chatLibrary.currentTabTitle;
        }
      );
    }
  };

  /**
   * Replaces the old conversation with the new conversation
   */
  $scope.replaceConversation = function (oldLayoutId, newConversation) {
    const { dialogType } = newConversation;
    const newLayoutId = $scope.getLayoutId(newConversation.id, dialogType);

    // remove old conversation from conversation list
    const oldConversation = $scope.chatUserDict[oldLayoutId];
    if (oldConversation) {
      const oldConversationId = oldConversation.id;
      $scope.chatLibrary.conversationsDict[oldConversationId].remove = true;
    }

    // replace in dialog list if exists
    const shouldOpenNewDialog = $scope.chatLibrary.dialogDict[oldLayoutId];
    $scope.closeDialog(oldLayoutId);
    if (shouldOpenNewDialog) {
      $scope.updateDialogList(newLayoutId, true);
    }

    // if 1:1, update userConversationsDict to point to new conversation
    if (
      dialogType !== chatUtility.dialogType.CHAT &&
      dialogType !== chatUtility.dialogType.FRIEND
    ) {
      return;
    }
    newConversation.participants.forEach(function (user) {
      const userId = user.id;
      if (userId !== $scope.chatLibrary.userId) {
        $scope.chatLibrary.userConversationsDict[userId] = newConversation.layoutId;
      }
    });
  };

  const getConversationsByIds = function (conversationIds, shouldPopDialog) {
    return chatService.getConversations(conversationIds).then(function (data) {
      if (data) {
        const promise = $scope.buildChatUserListByUnreadConversations(data, shouldPopDialog);
        $scope.getPlaceDetailsForNewPlaceIds(data);
        return promise;
      }
    });
  };

  const fetchConversations = function (id) {
    const conversationIds = [];
    conversationIds.push(id);
    return getConversationsByIds(conversationIds, true);
  };

  const multiFetchConversations = function (conversationIds) {
    // fetch conversations in batches of page size
    for (
      let i = 0;
      i < conversationIds.length;
      i += chatUtility.chatApiParams.pageSizeOfConversations
    ) {
      const batch = conversationIds.slice(i, i + chatUtility.chatApiParams.pageSizeOfConversations);
      getConversationsByIds(batch, false);
    }
  };

  // after fetching the new conversation, replace the old conversation with the new conversation
  const fetchMigratedConversation = function (oldId, newId) {
    fetchConversations(newId).then(function (data) {
      if (!data) {
        return;
      }

      const conversation = data[0];
      if (!conversation) {
        return;
      }
      const { dialogType } = conversation;

      const oldLayoutId = $scope.getLayoutId(oldId, dialogType);
      const oldConversation = $scope.chatUserDict[oldLayoutId];
      if (!oldConversation) {
        return;
      }

      $scope.replaceConversation(oldLayoutId, conversation);
      $scope.processLatestMessageForConversations([
        { conversationId: conversation.id, messages: conversation.messages }
      ]);
    });
  };

  const updateChatConversation = function (allMessages, conversation, isSelf) {
    messageService.appendMessages($scope.chatLibrary, conversation, allMessages);
    gameService.fetchDataForLinkCard(allMessages, $scope.chatLibrary);
    messageUtility.hasUnreadMessages(conversation, allMessages);
    const latestMessage = allMessages[0];
    const typing = {
      status: false,
      userId: latestMessage.sender_user_id
    };
    $scope.updateConverationTypingStatus(conversation.id, typing);
    $scope.updateChatViewModel(conversation, true);
    if (conversation.hasUnreadMessages) {
      notifyUser(conversation);
    }
    if (!isSelf) {
      markActiveForDialog(conversation.layoutId, chatUtility.activeType.NEWMESSAGE);
    }
  };

  const getCurrentConversationMessages = function (
    layoutId,
    conversationId,
    exclusiveStartMessageId,
    isSelf
  ) {
    const allData = [];
    const conversation = $scope.chatUserDict[layoutId];
    let messageReceiveStartTime = null;
    if (!isSelf) {
      messageReceiveStartTime = new Date().getTime();
    }
    const updateChatConversationCallback = function (messageReceiveStartTime) {
      updateChatConversation(allData, conversation, isSelf);
      if (messageReceiveStartTime) {
        const messageReceiveEndTime = new Date().getTime();
        const messageReceiveInterval = messageReceiveEndTime - messageReceiveStartTime;
        chatService.sendPerformanceData(
          resources.performanceMeasurements.messageReceive,
          messageReceiveInterval
        );
      }
    };
    chatService.getMessagesByPageSize(
      conversation,
      exclusiveStartMessageId,
      chatUtility.dialogParams.smallestPageSizeOfGetMessages,
      allData,
      updateChatConversationCallback,
      messageReceiveStartTime
    );
  };

  const updateCurrentConversation = function (id, isSelf) {
    const layoutId = $scope.getLayoutId(id, chatUtility.dialogType.CHAT);
    if (angular.isUndefined($scope.chatUserDict[layoutId])) {
      fetchConversations(id);
    } else {
      getCurrentConversationMessages(layoutId, id, null, isSelf);
    }
  };

  $scope.resetDialogLayout = function (dialogLayout) {
    if (dialogLayout) {
      const dialogLayoutInitialization = { ...chatUtility.dialogLayout };
      const dialogLayoutResetConstant = { ...chatUtility.dialogLayoutResetConstant };

      angular.forEach(dialogLayoutInitialization, function (value, key) {
        if (angular.isUndefined(dialogLayout[key])) {
          dialogLayout[key] = { ...value };
        }
      });

      angular.forEach(dialogLayoutResetConstant, function (value, key) {
        dialogLayout[key] = { ...value };
      });
    }
  };

  $scope.retrieveDialogStatus = function () {
    // need to do with whole dialogDict
    if (
      angular.isDefined($scope.preSetChatLibrary) &&
      angular.isDefined($scope.preSetChatLibrary.dialogIdList)
    ) {
      const dialogIdList = { ...$scope.preSetChatLibrary.dialogIdList };

      if (dialogIdList.length === 0) {
        $scope.preSetChatLibrary.dialogDict = {};
        $scope.preSetChatLibrary.dialogsLayout = {};
        chatClientStorageUtilityService.removeFromStorage(
          chatClientStorageUtilityService.storageDictionary.dialogDict,
          $scope.chatLibrary.cookieOption
        );
        chatClientStorageUtilityService.removeFromStorage(
          chatClientStorageUtilityService.storageDictionary.dialogsLayout,
          $scope.chatLibrary.cookieOption
        );
        return false;
      }
      const { dialogDict } = $scope.preSetChatLibrary;
      const { dialogsLayout } = $scope.preSetChatLibrary;
      angular.forEach(dialogIdList, function (dialogId, idx) {
        if (dialogId !== chatUtility.newGroup.layoutId && !$scope.chatUserDict[dialogId]) {
          $scope.preSetChatLibrary.dialogIdList.splice(idx, 1);
          delete dialogDict[dialogId];
          delete dialogsLayout[dialogId];
        }

        $scope.resetDialogLayout(dialogsLayout[dialogId]);
      });
      $scope.chatLibrary.dialogIdList = $scope.preSetChatLibrary.dialogIdList;
      angular.forEach(dialogDict, function (dialog, layoutId) {
        if (!dialog.isUpdated) {
          dialog.isUpdated = true;
        }
        if (layoutId === chatUtility.newGroup.layoutId) {
          $scope.chatUserDict[chatUtility.newGroup.layoutId] = $scope.newGroup;
        }
        $scope.chatLibrary.dialogDict[layoutId] = dialog;
        if (dialogsLayout[layoutId]) {
          $scope.chatLibrary.dialogsLayout[layoutId] = dialogsLayout[layoutId];
        }
      });
      $scope.maybeCloseNewGroupDialog();
    }
  };

  const chatBarOpenEnabled = function () {
    return (
      $window.innerWidth >= chatUtility.chatLayout.thresholdChatBarOpen &&
      !$scope.chatLibrary.isTakeOverOn &&
      !angular.element('#GamesPageLeftColumn').length
    ); // window size large enough to fit, takeover is on or games page
  };

  let realTimeClient;
  $scope.setup = function () {
    $scope.chatUserDict = {};
    $scope.dialogType = { ...chatUtility.dialogType };
    $scope.userPresenceTypes = { ...chatUtility.userPresenceTypes };
    $scope.newGroup = { ...dialogAttributes.newGroup };
    $scope.selectedFriendIds = [];
    $scope.chatLibrary = { ...libraryInitialization.chatLibrary };
    if (angular.isDefined(RealTime)) {
      realTimeClient = RealTime.Factory.GetClient();
    }
  };

  $scope.initializePresetData = function () {
    // temp store cookie data
    $scope.preSetChatLibrary = {};

    if (
      chatClientStorageUtilityService.isStorageDefined(
        chatClientStorageUtilityService.storageDictionary.dialogIdList
      ) &&
      chatClientStorageUtilityService.isStorageDefined(
        chatClientStorageUtilityService.storageDictionary.dialogDict
      )
    ) {
      $scope.preSetChatLibrary = {
        dialogIdList: chatClientStorageUtilityService.getFromStorage(
          chatClientStorageUtilityService.storageDictionary.dialogIdList
        ),
        dialogDict: chatClientStorageUtilityService.getFromStorage(
          chatClientStorageUtilityService.storageDictionary.dialogDict
        ),
        dialogsLayout: chatClientStorageUtilityService.isStorageDefined(
          chatClientStorageUtilityService.storageDictionary.dialogsLayout
        )
          ? chatClientStorageUtilityService.getFromStorage(
              chatClientStorageUtilityService.storageDictionary.dialogsLayout
            )
          : {}
      };
    } else {
      $scope.preSetChatLibrary = {
        dialogIdList: [],
        dialogDict: {},
        dialogsLayout: {}
      };
    }

    if (
      chatClientStorageUtilityService.isStorageDefined(
        chatClientStorageUtilityService.storageDictionary.chatBarLayout
      )
    ) {
      $scope.preSetChatLibrary.chatBarLayout = chatClientStorageUtilityService.getFromStorage(
        chatClientStorageUtilityService.storageDictionary.chatBarLayout
      );
    }
    // setup api endpoint params for lazy loading
    $scope.chatApiParams = { ...chatUtility.chatApiParams };
  };

  $scope.initializeChatBar = function () {
    if (!$scope.chatLibrary.chatLayout.chatBarInitialized) {
      if (chatBarOpenEnabled() && !$scope.preSetChatLibrary.chatBarLayout) {
        $scope.chatLibrary.chatLayout.collapsed = false;
      } else if ($scope.preSetChatLibrary.chatBarLayout) {
        $scope.chatLibrary.chatLayout.collapsed = $scope.preSetChatLibrary.chatBarLayout.collapsed;
      } else if (!chatBarOpenEnabled()) {
        $scope.chatLibrary.chatLayout.collapsed = true;
      }
      $scope.chatLibrary.chatLayout.chatBarInitialized = true;
    }
    performanceService.logSinglePerformanceMark(
      chatUtility.performanceMarkLabels.chatPageDataLoaded
    );
  };

  const updateLayoutIdList = function (layoutId, remove) {
    const position = $scope.chatLibrary.layoutIdList.indexOf(layoutId);
    if (remove && position > -1) {
      $scope.chatLibrary.layoutIdList.splice(position, 1);
    } else if (!remove && position < 0) {
      $scope.chatLibrary.layoutIdList.push(layoutId);
    }
  };

  const doesUserHavePrivateConversation = function (userId) {
    if ($scope.chatLibrary.userConversationsDict[userId]) {
      return $scope.chatLibrary.userConversationsDict[userId];
    }
    return null;
  };
  $scope.removeFriend = function (userId) {
    let layoutId = doesUserHavePrivateConversation(userId);
    if (!layoutId) {
      layoutId = $scope.getLayoutId(userId, chatUtility.dialogType.FRIEND);
    }
    const conversation = $scope.chatUserDict[layoutId];
    if (conversation) {
      const conversationId = $scope.chatUserDict[layoutId].id;
      $scope.chatLibrary.conversationsDict[conversationId].remove = true;
    }

    if ($scope.chatLibrary.chatLayoutIds.indexOf(layoutId) > -1) {
      $scope.closeDialog(layoutId);
    }

    if ($scope.chatLibrary.chatLayoutIds.length === 0) {
      $scope.chatLibrary.chatLayout.chatLandingEnabled = true;
    }
  };

  const initialzeUrlParser = function () {
    if (window && window.location) {
      $log.debug('--- -initialzeUrlParser- ---');
      let query = window.location.search;
      if (query && query.indexOf('?') > -1) {
        query = query.substr(1);
        query.split('&').forEach(function (part) {
          const item = part.split('=');
          const key = item[0];
          const value = decodeURIComponent(item[1]);
          switch (key) {
            case chatUtility.urlParamNames.startConversationWithUserId:
              $scope.startSpecificConversationFromUserId(value);
              break;
            case chatUtility.urlParamNames.conversationId:
              $scope.chatLibrary.chatLayout.urlParseInitialized = true;
              $scope.startSpecificConversationFromConvId(value);
              break;
          }
        });
      }
    }
  };

  $scope.getAllFriends = function () {
    usersPresenceService.getFriendsPresence().then(
      result => {
        $scope.getFriendsInfo(result);
      },
      error => {
        console.debug(error);
      }
    );
  };

  $scope.updateFriendsDictBySearch = friends => {
    if (friends?.length) {
      const userIds = [];
      const allUserIds = [];

      angular.forEach(friends, friend => {
        const currentFriend = friend;
        const { id: userId } = currentFriend;
        currentFriend.id = parseInt(userId, 10);

        if (!$scope.chatLibrary.friendsDict[userId]) {
          $scope.chatLibrary.friendsDict[userId] = {
            id: currentFriend.id,
            presence: {
              userPresenceType: currentFriend.userPresence
                ? presenceLayout.conversion[currentFriend.userPresence.UserPresenceType]
                : 0
            }
          };
          userIds.push(userId);
        }
        allUserIds.push(userId);
      });

      const userProfileFields = [UserProfileField.Names.CombinedName];

      userProfilesService
        .watchUserProfiles(allUserIds, userProfileFields)
        .subscribe(({ loading, error, data }) => {
          Object.keys(data).forEach(function (id) {
            if ($scope.chatLibrary.friendsDict[id]) {
              $scope.chatLibrary.friendsDict[id].nameForDisplay = data[id].names.combinedName;
            }
          });
        });

      if (userIds && userIds.length > 0) {
        usersService.getAvatarHeadshots(userIds, $scope.chatLibrary.friendsDict);
      }
    }
  };

  $scope.updateDialogList = function (layoutId, autoPop) {
    getDialogsNumber();

    while (
      $scope.chatLibrary.chatLayout.numberOfDialogs +
        $scope.chatLibrary.chatLayout.numberOfMinimizedDialogs >=
      $scope.chatLibrary.chatLayout.maxOpenDialogs
    ) {
      const oldestLayoutId = $scope.chatLibrary.dialogIdList[0];
      $scope.closeDialog(oldestLayoutId);
      getDialogsNumber();
    }

    if ($scope.dialogsOverflowWindow()) {
      while (
        $scope.chatLibrary.dialogIdList.length >=
        $scope.chatLibrary.chatLayout.availableNumberOfDialogs
      ) {
        const lastLayoutId = $scope.chatLibrary.dialogIdList.pop();
        if (angular.isUndefined(lastLayoutId)) {
          break;
        }
        $scope.chatLibrary.dialogDict[lastLayoutId].isUpdated = true;
        $scope.chatLibrary.dialogDict[lastLayoutId].updateStatus =
          chatUtility.dialogStatus.MINIMIZE;
        // remove layoutId in the minimize dialog list
        const positionInMinimizedList = $scope.chatLibrary.minimizedDialogIdList.indexOf(layoutId);
        if (positionInMinimizedList > -1) {
          // if the dialog was previously collapsed while minimized, then uncollapse as the dialog is restored)
          if ($scope.chatLibrary.dialogsLayout[layoutId].collapsed) {
            $scope.chatLibrary.dialogsLayout[layoutId].collapsed = false;
          }
          $scope.chatLibrary.minimizedDialogIdList.splice(positionInMinimizedList, 1);
          delete $scope.chatLibrary.minimizedDialogData[layoutId];
        }
      }
    }

    if ($scope.chatLibrary.dialogIdList.indexOf(layoutId) < 0) {
      $scope.chatLibrary.dialogIdList.push(layoutId);
    }
    const dialogInitValue = { ...chatUtility.dialogInitValue };
    if (angular.isDefined(autoPop) && autoPop) {
      dialogInitValue.autoOpen = true;
    }
    $scope.chatLibrary.dialogDict[layoutId] = dialogInitValue;
  };

  $scope.getUserConversations = function () {
    const cursor = $scope.chatApiParams.getUserConversationsNextCursor;
    chatService
      .getUserConversations(
        cursor,
        $scope.chatApiParams.pageSizeOfConversations,
        $scope.chatLibrary.friendsDict
      )
      .then(
        response => {
          const data = response.conversations;
          if (!cursor) {
            $scope.sendWebChatConversationsLoadedEvent(data);
          }
          performanceService.logSinglePerformanceMark(
            chatUtility.performanceMarkLabels.chatConversationsLoaded
          );
          let userIds = [];
          const { friendsDict } = $scope.chatLibrary;
          if (data && data.length > 0) {
            userIds = conversationsUtility.getUserIdsNotInFriendsDict(data, friendsDict);
            $scope.buildChatUserListByConversations(data, false);
            $scope.chatApiParams.getUserConversationsNextCursor = response.next_cursor;
            $scope.retrieveDialogStatus();
          }

          const isEndOfConversations = !response.next_cursor;
          if (!data || isEndOfConversations) {
            $scope.chatApiParams.loadMoreConversations = false;
            $scope.chatApiParams.getUserConversationsNextCursor = null;
            if (data && data.length === 0) {
              $scope.chatLibrary.chatLayout.chatLandingEnabled = true;
            }
          } else {
            $scope.chatApiParams.loadMoreConversations = true;
          }
          if ($scope.chatLibrary.chatLayout.pageDataLoading) {
            $scope.chatLibrary.chatLayout.pageDataLoading = false;
          }
          if (!$scope.chatLibrary.chatLayout.urlParseInitialized) {
            initialzeUrlParser();
          }
          contactsService.getUserContacts(userIds, friendsDict);
          return usersService.getUserInfo(userIds, friendsDict);
        },
        error => {
          console.debug(error);
        }
      );
  };

  $scope.getUserConversationsFromCursor = function(cursor) {
    chatService
      .getUserConversations(
        cursor,
        $scope.chatApiParams.pageSizeOfConversations,
        $scope.chatLibrary.friendsDict
      )
      .then(
        response => {
          const data = response.conversations;
          performanceService.logSinglePerformanceMark(
            chatUtility.performanceMarkLabels.chatConversationsLoaded
          );
          let userIds = [];
          const { friendsDict } = $scope.chatLibrary;
          if (data && data.length > 0) {
            userIds = conversationsUtility.getUserIdsNotInFriendsDict(data, friendsDict);
            $scope.buildChatUserListByConversations(data, false);
            $scope.retrieveDialogStatus();
          }

          if ($scope.chatLibrary.chatLayout.pageDataLoading) {
            $scope.chatLibrary.chatLayout.pageDataLoading = false;
          }
          if (!$scope.chatLibrary.chatLayout.urlParseInitialized) {
            initialzeUrlParser();
          }
          contactsService.getUserContacts(userIds, friendsDict);
          return usersService.getUserInfo(userIds, friendsDict);
        },
        error => {
          console.debug(error);
        }
      );
  };

  $scope.updateConversationTitle = function (conversationId) {
    const conversationIds = [conversationId];
    chatService.getConversations(conversationIds).then(
      function (conversations) {
        if (conversations) {
          $scope.buildChatUserListByUnreadConversations(conversations, true);
          angular.forEach(conversations, function (conversation) {
            if (conversation.id == conversationId) {
              let layoutId;
              if ($scope.chatLibrary.conversationsDict[conversationId]) {
                layoutId = $scope.chatLibrary.conversationsDict[conversationId].layoutId;
              } else {
                layoutId = $scope.getLayoutId(conversationId, chatUtility.dialogType.CHAT);
              }
              const currentConversation = $scope.chatUserDict[layoutId];
              chatUtility.updateConversationTitle(currentConversation, conversation.title);
            }
          });
        }
      },
      function () {
        $log.debug(' -------- getConversations request failed ------ ');
      }
    );
  };

  $scope.resetTypingStatusAsReceiver = function (dialogLayout, userIdForTyping) {
    $log.debug('--------- resetTypingStatusAsReceiver has been called-----------');
    const typingStatus = dialogLayout.typing;
    const userTypingStatus = dialogLayout.typing.userTypingDict[userIdForTyping];

    const indexOfUserTyping = dialogLayout.typing.userIds.indexOf(userIdForTyping);
    dialogLayout.typing.userIds.splice(indexOfUserTyping);
    dialogLayout.typing.isTypingFromSender = false;
    userTypingStatus.status = false;
    userTypingStatus.lastTimeReceiveTypingEvent = null;
    $interval.cancel(userTypingStatus.lastTimeReceiveTimer);
    delete dialogLayout.typing.userTypingDict[userIdForTyping];
    $interval.cancel(typingStatus.lastTimeReceiveTimer);
  };

  $scope.typingStatusForReceiverExpirationInterval = function (
    dialogLayout,
    currentDate,
    userIdForTyping
  ) {
    if (dialogLayout.typing.userIds.indexOf(userIdForTyping) < 0) {
      dialogLayout.typing.userIds.push(userIdForTyping);
    }
    const now = currentDate || new Date().getTime();
    const userTypingStatus = dialogLayout.typing.userTypingDict[userIdForTyping];
    if (!userTypingStatus.lastTimeReceiveTypingEvent) {
      userTypingStatus.lastTimeReceiveTypingEvent = now;
    }
    if (
      now - userTypingStatus.lastTimeReceiveTypingEvent >
        $scope.chatLibrary.typingInChatForReceiverExpirationMs ||
      !userTypingStatus.status
    ) {
      $scope.resetTypingStatusAsReceiver(dialogLayout, userIdForTyping);
    }
  };

  $scope.updateConverationTypingStatus = function (conversationId, typing) {
    const layoutId = $scope.chatLibrary.conversationsDict[conversationId]
      ? $scope.chatLibrary.conversationsDict[conversationId].layoutId
      : $scope.getLayoutId(conversationId);
    const conversation = $scope.chatUserDict[layoutId];
    const typingStatus = typing.status;
    const userIdForTyping = typing.userId;
    const dialogLayout = $scope.chatLibrary.dialogsLayout[layoutId];
    if (dialogLayout) {
      if (!dialogLayout.typing.userTypingDict[userIdForTyping]) {
        dialogLayout.typing.userTypingDict[userIdForTyping] = {};
      }
      dialogLayout.typing.isTypingFromSender = typingStatus;
      const userTypingStatus = dialogLayout.typing.userTypingDict[userIdForTyping];
      userTypingStatus.status = typingStatus;
      messageService.refreshTypingStatus(conversation, userIdForTyping, typingStatus, dialogLayout);
      if (typingStatus && !userTypingStatus.lastTimeReceiveTimer) {
        $log.debug(`--------- start a new timer-----------${userIdForTyping}`);
        $scope.typingStatusForReceiverExpirationInterval(dialogLayout, null, userIdForTyping);
        userTypingStatus.lastTimeReceiveTimer = $interval(function () {
          return $scope.typingStatusForReceiverExpirationInterval(
            dialogLayout,
            null,
            userIdForTyping
          );
        }, $scope.chatLibrary.typingInChatForReceiverExpirationMs);
      } else if (!typingStatus && userTypingStatus.lastTimeReceiveTimer) {
        $log.debug(`--------- cancel timer-----------${userIdForTyping}`);
        $scope.resetTypingStatusAsReceiver(dialogLayout, userIdForTyping);
      }
    }
  };

  $scope.fetchPlaceDetailsIntoPlacesLibrary = function (placeIds, conversations) {
    if (placeIds && placeIds.length > 0) {
      gameService.multiGetPlaceDetails(placeIds).then(function (data) {
        gameService.buildPlacesLibrary($scope.chatLibrary, data);
        const { placesLibrary } = $scope.chatLibrary;
        angular.forEach(conversations, function (conversation) {
          gameService.buildButtonLayoutPerConversation(conversation, placesLibrary);
        });
      });
    }
  };

  $scope.handleChannelsNotifications = function (data) {
    $log.debug(`--------- this is ${chatUtility.notificationsName.CommunicationChannelsNotifications} subscription -----------${data.Type}`);
    try {
      const type = data.Type;
      const channelId = data.ChannelId;
      switch (type) {
        case chatUtility.channelsNotificationType.messageCreated:
        case chatUtility.channelsNotificationType.systemMessageCreated:
          updateCurrentConversation(channelId);
          break;
        case chatUtility.channelsNotificationType.addedToChannel:
        case chatUtility.channelsNotificationType.channelCreated:
        case chatUtility.channelsNotificationType.channelUnarchived:
        case chatUtility.channelsNotificationType.participantsAdded:
        case chatUtility.channelsNotificationType.participantsRemoved:
          fetchConversations(channelId);
          break;
        case chatUtility.channelsNotificationType.channelArchived:
        case chatUtility.channelsNotificationType.channelDeleted:
        case chatUtility.channelsNotificationType.removedFromChannel:
          if (!$scope.chatLibrary.conversationsDict[channelId].remove) {
            var { layoutId } = $scope.chatLibrary.conversationsDict[channelId];
            $scope.chatLibrary.conversationsDict[channelId].remove = true;
            $scope.closeDialog(layoutId);
            fetchConversations(channelId);
          }
          break;
        case chatUtility.channelsNotificationType.channelUpdated:
          $scope.updateConversationTitle(channelId);
          break;
        case chatUtility.channelsNotificationType.participantTyping:
          var typing = {
            status: true, 
            userId: parseInt(data.Actor.Id)
          };
          $scope.updateConverationTypingStatus(channelId, typing);
          break;
      }
    } catch (e) {
      let message = `${chatUtility.notificationsName.CommunicationChannelsNotifications}:${data.Type}: `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.handleChatMigrationNotifications = function (data) {
    $log.debug(
      `--------- this is ${chatUtility.notificationsName.ChatMigrationNotifications} subscription -----------${data.Type}`
    );

    let oldId;
    let newId;

    try {
      const type = data.Type;
      if (type === chatUtility.notificationType.conversationBackfilled) {
        oldId = data.ConversationId;
        newId = data.ChannelId;
      } else if (type === chatUtility.notificationType.conversationReset) {
        oldId = data.ChannelId;
        newId = data.ConversationId;
      } else {
        return;
      }

      fetchMigratedConversation(oldId, newId);
    } catch (e) {
      let message = `${chatUtility.notificationsName.ChatMigrationNotifications}:${data.Type}: `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.handleChatModerationTypeEligibilityNotifications = function (data) {
    $log.debug(
      `--------- this is ${chatUtility.notificationsName.ChatModerationTypeEligibilityNotifications} subscription -----------`
    );
    if (!$scope.chatLibrary.isTrustedCommsWebEnabled) {
      return;
    }

    try {
      const conversationIds = data.channels_inspected;
      if (!conversationIds || conversationIds.length === 0) {
        return;
      }

      // filter for IDs in conversationsDict
      const filteredConversationIds = conversationIds.filter(function (conversationId) {
        return $scope.chatLibrary.conversationsDict[conversationId];
      });
      if (filteredConversationIds.length === 0) {
        return;
      }

      multiFetchConversations(filteredConversationIds);
    } catch (e) {
      let message = `${chatUtility.notificationsName.ChatModerationTypeEligibilityNotifications} `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.handleChatNotifications = function (data) {
    $log.debug(`--------- this is ChatNotifications subscription -----------${data.Type}`);
    try {
      const type = data.Type;
      const conversationId = data.ConversationId;
      switch (type) {
        case chatUtility.notificationType.newMessage:
          updateCurrentConversation(conversationId);
          break;
        case chatUtility.notificationType.newMessageBySelf:
          updateCurrentConversation(conversationId, true);
          break;
        case chatUtility.notificationType.newConversation:
        case chatUtility.notificationType.addedToConversation:
        case chatUtility.notificationType.participantAdded:
        case chatUtility.notificationType.participantLeft:
          fetchConversations(conversationId);
          break;
        case chatUtility.notificationType.removedFromConversation:
          if (!$scope.chatLibrary.conversationsDict[conversationId].remove) {
            var { layoutId } = $scope.chatLibrary.conversationsDict[conversationId];
            $scope.chatLibrary.conversationsDict[conversationId].remove = true;
            $scope.closeDialog(layoutId);
          }
          break;
        case chatUtility.notificationType.conversationTitleChanged:
          var actorTargetId = data.ActorTargetId;
          $scope.updateConversationTitle(conversationId);
          break;
        case chatUtility.notificationType.participantTyping:
          var typing = {
            status: data.IsTyping,
            userId: data.UserId
          };
          $scope.updateConverationTypingStatus(conversationId, typing);
          break;
        case chatUtility.notificationType.conversationUniverseChanged:
          if ($scope.chatLibrary.conversationsDict[conversationId]) {
            const rootPlaceId = data.RootPlaceId;
            const universeId = data.UniverseId;
            var actorTargetId = data.ActorTargetId;
            var { layoutId } = $scope.chatLibrary.conversationsDict[conversationId];
            const conversation = $scope.chatUserDict[layoutId];
            const placeName =
              $scope.chatLibrary.placesLibrary && $scope.chatLibrary.placesLibrary[rootPlaceId]
                ? $scope.chatLibrary.placesLibrary[rootPlaceId].placeName
                : '';
            const encodedPlaceName =
              $scope.chatLibrary.placesLibrary && $scope.chatLibrary.placesLibrary[rootPlaceId]
                ? $scope.chatLibrary.placesLibrary[rootPlaceId].encodedPlaceName
                : '';
            const actorUsername = $scope.chatLibrary.friendsDict[actorTargetId].name;
            const parameters = {
              rootPlaceId,
              universeId,
              actorUsername,
              userId: data.ActorTargetId,
              placeName,
              encodedPlaceName
            };
            const placeIds = [rootPlaceId];
            const conversations = [conversation];
            $scope.fetchPlaceDetailsIntoPlacesLibrary(placeIds, conversations);
            pinGameService.setPinGameData(conversation, parameters);
          }
          break;
      }
    } catch (e) {
      let message = `ChatNotifications:${data.Type}: `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.handleFriendshipNotifications = function (data) {
    $log.debug(`--------- this is FriendshipNotifications subscription -----------${data.Type}`);
    try {
      switch (data.Type) {
        case chatUtility.notificationType.friendshipDestroyed: // remove friends
          var userIds = data.EventArgs;
          angular.forEach(userIds, function (userId) {
            if (userId !== $scope.chatLibrary.userId) {
              $scope.$digest($scope.removeFriend(userId));
            }
          });
          // when friendship notification received, always flush fiends data
          usersPresenceService.getFriendsPresence(true).then(
            result => {
              $scope.getFriendsInfo(result);
            },
            error => {
              console.debug(error);
            }
          );
          $document.triggerHandler('Roblox.Friends.CountChanged');
          break;
        case chatUtility.notificationType.friendshipCreated:
          // when friendship notification received, always flush fiends data
          usersPresenceService.getFriendsPresence(true).then(
            result => {
              $scope.getFriendsInfo(result);
            },
            error => {
              console.debug(error);
            }
          );
          // refetch the first page of conversations in-case new friends conversation was created
          $scope.getUserConversationsFromCursor('');
          $document.triggerHandler('Roblox.Friends.CountChanged');
          break;
      }
    } catch (e) {
      let message = `FriendshipNotifications:${data.Type}: `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.handleUserTagNotifications = function (data) {
    if (data.Type === chatUtility.notificationType.userTagUpdate) {
      contactsService.getUserContacts(
        Object.keys($scope.chatLibrary.friendsDict),
        $scope.chatLibrary.friendsDict,
        contactsService.options.skipCache
      );
    }
  };

  $scope.buildPlayTogetherInConversationFromPresence = function (
    layoutIdList,
    rootPlaceId,
    presenceData
  ) {
    angular.forEach(layoutIdList, function (layoutId) {
      const conversation = $scope.chatUserDict[layoutId];
      const placeIds = [rootPlaceId];
      playTogetherService.sortPlayTogetherIds(conversation, presenceData);
      $scope.fetchPlaceDetailsIntoPlacesLibrary(placeIds, [conversation]);
      if ($scope.chatLibrary.dialogDict[layoutId]) {
        // update system message for game play update
        if (
          conversation.pinGame &&
          rootPlaceId === conversation.pinGame.rootPlaceId &&
          presenceData.userId !== $scope.chatLibrary.userId
        ) {
          conversation.recentUserIdFromPresence = presenceData.userId;
          conversation.recentPlaceIdFromPresence = rootPlaceId;
          messageService.buildSystemMessage(
            chatUtility.notificationType.presenceOnline,
            conversation
          );
        }

        const dialogLayout = $scope.chatLibrary.dialogsLayout[layoutId];
        if (
          !dialogLayout.togglePopoverParams.isOpen &&
          !conversation.placeForShown &&
          conversation.playTogetherIds &&
          conversation.playTogetherIds.length > 0
        ) {
          dialogLayout.togglePopoverParams.isOpen = true;
        }
      }

      // update place for shown in conversation and dialog header
      playTogetherService.setPlaceForShown(conversation);
    });
  };

  $scope.releasePlayerFromActivePlaceLists = function (layoutIdList, userId) {
    angular.forEach(layoutIdList, function (layoutId) {
      const conversation = $scope.chatUserDict[layoutId];
      const placeIdsThatNotActive = [];
      angular.forEach(conversation.playTogetherDict, function (playTogether, pId) {
        pId = parseInt(pId);
        if (playTogether.playerIds.indexOf(userId) > -1) {
          const position = playTogether.playerIds.indexOf(userId);
          playTogether.playerIds.splice(position, 1);
          if (playTogether.playerIds.length === 0) {
            placeIdsThatNotActive.push(pId);
          }
        }
      });
      if (placeIdsThatNotActive && placeIdsThatNotActive.length > 0) {
        angular.forEach(placeIdsThatNotActive, function (pId) {
          const position = conversation.playTogetherIds.indexOf(pId);
          conversation.playTogetherIds.splice(position, 1);
          delete conversation.playTogetherDict[pId];
        });
      }
      playTogetherService.setPlaceForShown(conversation);
      if (conversation.pinGame && conversation.pinGame.rootPlaceId) {
        const { rootPlaceId } = conversation.pinGame;
        gameService.updateButtonLayoutPerConversation(conversation, rootPlaceId);
      }
    });
  };

  $scope.vanishRootPlaceIdFromPlayTogether = function (playerId, expiredRootPlaceId, layoutIdList) {
    angular.forEach(layoutIdList, function (layoutId) {
      const conversation = $scope.chatUserDict[layoutId];
      const expiredPlaceIds = [];
      angular.forEach(conversation.playTogetherDict, function (playTogether, pId) {
        pId = parseInt(pId);
        if (
          expiredRootPlaceId === pId &&
          playTogether.playerIds.length === 1 &&
          playTogether.playerIds.indexOf(playerId) > -1
        ) {
          expiredPlaceIds.push(pId);
        }
      });
      if (expiredPlaceIds && expiredPlaceIds.length > 0) {
        angular.forEach(expiredPlaceIds, function (pId) {
          const position = conversation.playTogetherIds.indexOf(pId);
          conversation.playTogetherIds.splice(position, 1);
          delete conversation.playTogetherDict[pId];
        });
      }
    });
  };

  $scope.updatePresenceInFriendDict = function (presenceData) {
    $scope.chatLibrary.friendsDict[presenceData.userId].userPresenceType =
      presenceData.userPresenceType;
    $scope.chatLibrary.friendsDict[presenceData.userId].presenceData = presenceData;
    $scope.chatLibrary.friendsDict[presenceData.userId].presence = presenceData;
  };

  $scope.updatePresenceStatus = function (response) {
    for (let i = 0; i < response.length; i++) {
      const presenceData = response[i];
      const { userId } = presenceData;
      if (!$scope.chatLibrary.friendsDict[userId]) {
        $scope.chatLibrary.friendsDict[userId] = {};
      }

      const { userPresenceType } = presenceData;
      const existingUserPresenceData = $scope.chatLibrary.friendsDict[userId].presence;
      let layoutIdList = null;
      switch (userPresenceType) {
        case presenceLayout.status.inGame:
          var newRootPlaceId = presenceData.rootPlaceId;
          if (
            !existingUserPresenceData ||
            userPresenceType !== existingUserPresenceData.userPresenceType ||
            newRootPlaceId !== existingUserPresenceData.rootPlaceId
          ) {
            layoutIdList = $scope.chatLibrary.layoutIdsDictPerUserId[userId];
            if (existingUserPresenceData && existingUserPresenceData.rootPlaceId) {
              $scope.vanishRootPlaceIdFromPlayTogether(
                userId,
                existingUserPresenceData.rootPlaceId,
                layoutIdList
              );
            }
            $scope.updatePresenceInFriendDict(presenceData);
            if (newRootPlaceId) {
              $scope.buildPlayTogetherInConversationFromPresence(
                layoutIdList,
                newRootPlaceId,
                presenceData
              );
            }
          }
          break;
        default:
          if (
            !existingUserPresenceData ||
            userPresenceType !== existingUserPresenceData.userPresenceType
          ) {
            $scope.updatePresenceInFriendDict(presenceData);

            if (
              existingUserPresenceData &&
              existingUserPresenceData.userPresenceType === presenceLayout.status.inGame
            ) {
              layoutIdList = $scope.chatLibrary.layoutIdsDictPerUserId[userId];
              $scope.releasePlayerFromActivePlaceLists(layoutIdList, userId);
            }
          }
          break;
      }
    }
  };

  $scope.listenToPresenceServiceInWeb = () => {
    document.addEventListener('Roblox.Presence.Update', event => {
      if (event?.detail) {
        $timeout(() => {
          $scope.updatePresenceStatus(event.detail);
        }, 0);
      }
    });
  };
  $scope.unsubscribeRealTimeForChat = function () {
    realTimeClient.Unsubscribe(
        chatUtility.notificationsName.CommunicationChannelsNotifications,
        $scope.handleChannelsNotifications
    );
    realTimeClient.Unsubscribe(
      chatUtility.notificationsName.ChatMigrationNotifications,
      $scope.handleChatMigrationNotifications
    );
    realTimeClient.Unsubscribe(
      chatUtility.notificationsName.ChatModerationTypeEligibilityNotifications,
      $scope.handleChatModerationTypeEligibilityNotifications
    );
    realTimeClient.Unsubscribe(
      chatUtility.notificationsName.ChatNotifications,
      $scope.handleChatNotifications
    );
    realTimeClient.Unsubscribe(
      chatUtility.notificationsName.FriendshipNotifications,
      $scope.handleFriendshipNotifications
    );
    realTimeClient.Unsubscribe(
      chatUtility.notificationsName.UserTagNotifications,
      $scope.handleUserTagNotifications
    );
  };

  $scope.handleUserSettingsChanged = function (data) {
    $log.debug(
      `--------- this is UserSettingsChangedNotifications subscription -----------${data.Type}`
    );
    try {
      if (!$scope.chatLibrary?.isWebChatSettingsMigrationEnabled) {
        return;
      }
      const settingsChanged = data.SettingsChanged ?? [];
      if (
        !settingsChanged.includes('WhoCanChatWithMeInApp') &&
        !settingsChanged.includes('WhoCanGroupChatWithMeInApp')
      ) {
        return;
      }

      const oldIsChatEnabled = $scope.getIsChatEnabled();
      // eslint-disable-next-line consistent-return
      return $scope
        .fetchAllWebChatSettings()
        .then(allData => {
          $scope.parseChatSettingsResponsesForChatEnabled(allData);
          const newIsChatEnabled = $scope.getIsChatEnabled();
          if (!newIsChatEnabled) {
            $scope.unsubscribeRealTimeForChat();
          } else if (!oldIsChatEnabled && newIsChatEnabled) {
            $scope.handleSignalRSuccess(true);
            $scope.initializeRealTimeSubscriptionsForChat();
          }

          $scope.maybeCloseNewGroupDialog();
          $scope.$apply();
        })
        .catch(error => {
          $log.debug('Error getting chat user settings', error);
        });
    } catch (e) {
      let message = `UserSettingsChanged:${data.Type}: `;
      if (e && e.message) {
        message += e.message;
      }
      googleAnalyticsEventsService.fireEvent(
        $scope.chatLibrary.googleAnalyticsEvent.category,
        $scope.chatLibrary.googleAnalyticsEvent.action,
        message
      );
    }
  };

  $scope.initializeRealTimeSubscriptionsForUserSetttingsChanged = function () {
    if (angular.isDefined(realTimeClient)) {
      realTimeClient.Subscribe(
        chatUtility.notificationsName.UserSettingsChangedNotifications,
        $scope.handleUserSettingsChanged
      );
    }
  };

  $scope.initializeRealTimeSubscriptionsForChat = () => {
    if (angular.isDefined(realTimeClient)) {
      performanceService.logSinglePerformanceMark(
        chatUtility.performanceMarkLabels.chatSignalRInitializing
      );
      realTimeClient.SubscribeToConnectionEvents(
        $scope.handleSignalRSuccess,
        $scope.handleSignalRSuccess,
        $scope.handleSignalRError,
        chatUtility.notificationsName.ChatNotifications
      );

      realTimeClient.Subscribe(
          chatUtility.notificationsName.CommunicationChannelsNotifications,
          $scope.handleChannelsNotifications
      );

      realTimeClient.Subscribe(
        chatUtility.notificationsName.ChatMigrationNotifications,
        $scope.handleChatMigrationNotifications
      );

      realTimeClient.Subscribe(
        chatUtility.notificationsName.ChatModerationTypeEligibilityNotifications,
        $scope.handleChatModerationTypeEligibilityNotifications
      );

      realTimeClient.Subscribe(
        chatUtility.notificationsName.ChatNotifications,
        $scope.handleChatNotifications
      );

      realTimeClient.Subscribe(
        chatUtility.notificationsName.FriendshipNotifications,
        $scope.handleFriendshipNotifications
      );

      realTimeClient.Subscribe(
        chatUtility.notificationsName.UserTagNotifications,
        $scope.handleUserTagNotifications
      );

      $scope.listenToPresenceServiceInWeb();
    }
  };

  $scope.handleSignalRSuccess = function (isReloadRequired) {
    $log.debug(' -------- Signal R is connected ------ ');
    if ($scope.chatLibrary.chatLayout.errorMaskEnable) {
      $scope.$apply(function () {
        $scope.chatLibrary.chatLayout.errorMaskEnable = false;
      });
    }
    if ($scope.chatLibrary.timer) {
      $timeout.cancel($scope.chatLibrary.timer);
    }
    if (!isReloadRequired) {
      performanceService.logSinglePerformanceMark(
        chatUtility.performanceMarkLabels.chatSignalRSucceeded
      );
    }

    if ($scope.chatLibrary.chatLayout.pageInitializing) {
      $scope.chatLibrary.chatLayout.pageInitializing = false;
    } else {
      try {
        if (isReloadRequired) {
          $scope.initializePresetData();
          $scope.initializeChat();
        }
      } catch (e) {
        let message = 'handleSignalRSuccess: ';
        if (e && e.message) {
          message += e.message;
        }
        googleAnalyticsEventsService.fireEvent(
          $scope.chatLibrary.googleAnalyticsEvent.category,
          $scope.chatLibrary.googleAnalyticsEvent.action,
          message
        );
      }
    }
  };

  $scope.handleSignalRError = function () {
    $log.debug(' -------- Signal R is disconnected ------ ');
    $scope.chatLibrary.timer = $timeout(function () {
      $scope.chatLibrary.chatLayout.errorMaskEnable = true;
    }, parseInt($scope.chatLibrary.signalRDisconnectionResponseInMilliseconds));
  };

  $scope.onResize = function () {
    if (
      $scope.chatLibrary.chatLayout.numberOfDialogs >
      $scope.chatLibrary.chatLayout.availableNumberOfDialogs
    ) {
      while (
        $scope.chatLibrary.dialogIdList.length >
        $scope.chatLibrary.chatLayout.availableNumberOfDialogs
      ) {
        $log.debug(
          ` -------------overflow ------ $scope.chatLibrary.dialogIdList.length ------------- ${$scope.chatLibrary.dialogIdList.length}`
        );
        var lastLayoutId = $scope.chatLibrary.dialogIdList.pop();
        if (angular.isUndefined(lastLayoutId)) {
          break;
        }
        if (lastLayoutId && $scope.chatLibrary.dialogDict[lastLayoutId]) {
          $scope.chatLibrary.dialogDict[lastLayoutId].isUpdated = true;
          $scope.chatLibrary.dialogDict[lastLayoutId].updateStatus =
            chatUtility.dialogStatus.MINIMIZE;
        }
      }
    } else if (
      $scope.chatLibrary.chatLayout.numberOfDialogs <
      $scope.chatLibrary.chatLayout.availableNumberOfDialogs
    ) {
      while (
        $scope.chatLibrary.dialogIdList.length <
        $scope.chatLibrary.chatLayout.availableNumberOfDialogs
      ) {
        $log.debug(
          ` -------------fit ------ $scope.chatLibrary.dialogIdList.length ------------- ${$scope.chatLibrary.dialogIdList.length}`
        );
        var lastLayoutId = $scope.chatLibrary.minimizedDialogIdList.pop();
        if (angular.isUndefined(lastLayoutId)) {
          break;
        }
        if (lastLayoutId && $scope.chatLibrary.minimizedDialogData[lastLayoutId]) {
          delete $scope.chatLibrary.minimizedDialogData[lastLayoutId];
          $scope.chatLibrary.dialogIdList.push(lastLayoutId);
          const dialogInitValue = { ...chatUtility.dialogInitValue };
          $scope.chatLibrary.dialogDict[lastLayoutId] = dialogInitValue;
        }
      }
    }
    $scope.chatLibrary.chatLayout.resizing = false;
  };

  $scope.getLayoutId = function (id, dialogType) {
    switch (dialogType) {
      case chatUtility.dialogType.FRIEND:
        return `friend_${id}`;
      case chatUtility.dialogType.NEWGROUPCHAT:
        return chatUtility.newGroup.dialogType;
      case chatUtility.dialogType.CHAT:
      case chatUtility.dialogType.GROUPCHAT:
      case chatUtility.dialogType.ADDFRIENDS:
      default:
        return `conv_${id}`;
    }
  };

  $scope.getUserInfoForConversation = function (conversation) {
    if (conversation.participants) {
      conversation.userIds = [];
      conversation.candidatePlayerIds = [];
      const userIdsNotInFriendsDict = [];

      conversation.participants.forEach(function (user) {
        const { id: userId } = user;
        const username = user.name;
        switch (conversation.dialogType) {
          case $scope.dialogType.GROUPCHAT:
            conversation.userIds.push(userId);
            if (userId !== $scope.chatLibrary.userId) {
              if (
                (conversation.playerIds && conversation.playerIds.indexOf(userId) < 0) ||
                !conversation.playerIds
              ) {
                conversation.candidatePlayerIds.push(userId);
              }
            }
            break;
          case $scope.dialogType.FRIEND:
          case $scope.dialogType.CHAT:
            if (userId !== $scope.chatLibrary.userId) {
              conversation.userIds.push(userId);
              conversation.displayUserId = userId;
              conversation.username = username;
              if (
                (conversation.playerIds && conversation.playerIds.indexOf(userId) < 0) ||
                !conversation.playerIds
              ) {
                conversation.candidatePlayerIds.push(userId);
              }
            }
            break;
          default:
            conversation.userIds.push(userId);
        }
        if (userId !== $scope.chatLibrary.userId) {
          $scope.buildPlayTogetherListForEachConveration(user, conversation);
        }
        if (!$scope.chatLibrary.friendsDict[userId]) {
          userIdsNotInFriendsDict.push(userId);
          const { name, display_name } = user;
          $scope.chatLibrary.friendsDict[userId] = {
            id: userId,
            name,
            display_name,
            nameForDisplay: DisplayNames?.Enabled() ? display_name : name
          };
        }

        if (!$scope.chatLibrary.layoutIdsDictPerUserId[userId]) {
          $scope.chatLibrary.layoutIdsDictPerUserId[userId] = [];
        }
        if ($scope.chatLibrary.layoutIdsDictPerUserId[userId].indexOf(conversation.layoutId) < 0) {
          $scope.chatLibrary.layoutIdsDictPerUserId[userId].push(conversation.layoutId);
        }
      });

      if (userIdsNotInFriendsDict.length > 0) {
        usersService
          .getUserInfo(userIdsNotInFriendsDict, $scope.chatLibrary.friendsDict)
          .then(function (response) {
            if (response) {
              userIdsNotInFriendsDict.forEach(function (userId) {
                const user = $scope.chatLibrary.friendsDict[userId];
                $scope.buildPlayTogetherListForEachConveration(user, conversation);
                $scope.getPlaceDetailsForNewPlaceIds([conversation]);
              });
              contactsService.getUserContacts(
                userIdsNotInFriendsDict,
                $scope.chatLibrary.friendsDict,
                contactsService.options.noCache
              );
            }
          });
      }
      playTogetherService.setPlaceForShown(conversation); // set active game for shown game
    }
  };

  $scope.buildPlayTogetherListForEachConveration = function (user, conversation) {
    if (!$scope.chatLibrary.friendsDict) {
      return false;
    }

    const userInfo = $scope.chatLibrary.friendsDict[user.id];
    if (
      userInfo &&
      userInfo.presence &&
      userInfo.presence.userPresenceType === presenceLayout.status.inGame
    ) {
      playTogetherService.sortPlayTogetherIds(conversation, userInfo.presence);
    }
  };

  $scope.updateChatViewModel = function (conversation, addToFront) {
    // remove friend object from chatUserDict and update chatLayoutIds
    if (!conversation.isGroupChat && conversation.dialogType === chatUtility.dialogType.CHAT) {
      conversation.participants.forEach(function (user) {
        const userId = user.id;
        if (userId !== $scope.chatLibrary.userId) {
          const friendId = $scope.getLayoutId(userId, chatUtility.dialogType.FRIEND);
          $scope.replaceConversation(friendId, conversation);
        }
      });
    }
    switch (conversation.dialogType) {
      case $scope.dialogType.GROUPCHAT:
        conversation.name = conversation.title;
        $scope.chatLibrary.allConversationLayoutIdsDict[conversation.id] = conversation.layoutId;
        break;
      case $scope.dialogType.CHAT:
        conversation.name = conversation.title;
        $scope.chatLibrary.allConversationLayoutIdsDict[conversation.id] = conversation.layoutId;
        break;
      default:
        if (angular.isDefined(conversation.Username)) {
          conversation.name = conversation.Username;
        }
    }
    // add new conversation into the right place;
    const userProfileFields = [UserProfileField.Names.CombinedName];
    const { userIds, isGroupChat } = conversation;

    userProfilesService
      .watchUserProfiles(userIds, userProfileFields)
      .subscribe(({ loading, error, data }) => {
        const names = [];
        angular.forEach(data, user => {
          names.push(user.names.combinedName);
        });

        names.sort();
        const newTitle = names.join(', ');

        if (isGroupChat) {
          const { titleForViewer } = conversation.conversationTitle;
          chatUtility.updateConversationTitle(
            conversation,
            conversation.hasDefaultName ? newTitle : titleForViewer
          );
        } else {
          chatUtility.updateConversationTitle(conversation, newTitle);
        }
        $scope.$applyAsync();
      });

    $scope.chatUserDict[conversation.layoutId] = conversation;
    const position = $scope.chatLibrary.chatLayoutIds.indexOf(conversation.layoutId);
    if (position > -1) {
      // remove the existing position in order to reset the position
      $scope.chatLibrary.chatLayoutIds.splice(position, 1);
    }
    if (addToFront) {
      const layoutId = $scope.chatLibrary.chatLayoutIds[0];
      const firstConversation = $scope.chatUserDict[layoutId];
      $scope.chatLibrary.chatLayoutIds.unshift(conversation.layoutId);
    } else {
      $scope.chatLibrary.chatLayoutIds.push(conversation.layoutId);
    }
    updateLayoutIdList(conversation.layoutId);
    // update chatLibrary
    if (!$scope.chatLibrary.conversationsDict[conversation.id]) {
      $scope.chatLibrary.conversationsDict[conversation.id] = {
        ...chatUtility.conversationInitStatus
      };
      $scope.chatLibrary.conversationsDict[conversation.id].layoutId = conversation.layoutId;
    }
  };

  $scope.updateConversationInLocalStorage = function (newConversation) {
    const params = {
      pageNumber: 1,
      pageSize: $scope.chatApiParams.pageSizeOfConversations
    };
    const localStorageName = storageService.getStorageName(
      storageService.chatDataName.getUserConversations,
      params
    );
    const cacheData = storageService.getChatDataFromLocalStorage(localStorageName);
    if (cacheData) {
      const conversations = cacheData.data;
      conversations.unshift(newConversation);
      storageService.saveChatDataToLocalStorage(localStorageName, conversations);
    }
  };

  $scope.buildChatUserListByUnreadConversations = async function (
    unreadConversations,
    shouldPopDialog
  ) {
    for (let i = 0; i < unreadConversations.length; i++) {
      let unreadConversation = unreadConversations[i];
      unreadConversation.isGroupChat =
        chatUtility.conversationType.multiUserConversation === unreadConversation.type;

      unreadConversation.dialogType = unreadConversation.isGroupChat
        ? chatUtility.dialogType.GROUPCHAT
        : chatUtility.dialogType.CHAT;
      $scope.getUserInfoForConversation(unreadConversation);

      const userProfileFields = [UserProfileField.Names.CombinedName];
      const { userIds } = unreadConversation;

      const names = [];
      const data = await userProfilesService.queryUserProfiles(userIds, userProfileFields);

      angular.forEach(data, user => {
        names.push(user.names.combinedName);
      });

      names.sort();
      const newTitle = names.join(', ');

      if (unreadConversation.isGroupChat) {
        const { titleForViewer } = unreadConversation.conversationTitle;
        chatUtility.updateConversationTitle(
          unreadConversation,
          unreadConversation.hasDefaultName ? newTitle : titleForViewer
        );
      } else {
        chatUtility.updateConversationTitle(unreadConversation, newTitle);
      }

      unreadConversation.isUserPending = $scope.getIsUserPending(unreadConversation);
      unreadConversation.isConversationUnavailableWithUser = $scope.getIsConversationDisabledWithUser(
        unreadConversation
      );

      messageService.formatTimestampInConversation(unreadConversation);
      const layoutId = $scope.getLayoutId(unreadConversation.id, chatUtility.dialogType.CHAT);
      // existing conversation
      if ($scope.chatUserDict[layoutId]) {
        const existingConversation = $scope.chatUserDict[layoutId];
        if (
          unreadConversation.hasUnreadMessages &&
          unreadConversation.chatMessages &&
          unreadConversation.chatMessages.length > 0
        ) {
          existingConversation.hasUnreadMessages = true;
          if (
            $scope.chatLibrary.dialogDict[layoutId] &&
            $scope.chatLibrary.dialogIdList.indexOf(layoutId) > -1
          ) {
            messageService.processMessages(
              $scope.chatLibrary,
              existingConversation,
              unreadConversation.chatMessages,
              $scope.chatLibrary.friendsDict
            );
            gameService.fetchDataForLinkCard(unreadConversation.chatMessages, $scope.chatLibrary);
          }
          chatUtility.sanitizeMessage(unreadConversation.chatMessages[0]);
          existingConversation.displayMessage = messageService.buildDisplayMessage(unreadConversation.chatMessages[0]);
          $scope.updateChatViewModel(existingConversation, true);
        }

        // if title changed, update in list
        if (unreadConversation.title !== existingConversation.title) {
          chatUtility.updateConversationTitle(existingConversation, unreadConversation.title);
        }

        existingConversation.participants = unreadConversation.participants;
        existingConversation.isUserPending = unreadConversation.isUserPending;
        existingConversation.isConversationUnavailableWithUser =
          unreadConversation.isConversationUnavailableWithUser;
        existingConversation.moderationType = unreadConversation.moderationType;
        existingConversation.participantPendingStatus = unreadConversation.participantPendingStatus;
        existingConversation.userPendingStatus = unreadConversation.userPendingStatus;
        $scope.getUserInfoForConversation(existingConversation);
        if (shouldPopDialog) {
          notifyUser(existingConversation);
        }
      } else {
        $scope.updateConversationInLocalStorage(unreadConversation);
        unreadConversation.layoutId = layoutId;
        $scope.updateChatViewModel(unreadConversation, true);
        if (shouldPopDialog) {
          notifyUser(unreadConversation);
        }
      }
      $scope.$apply();
    }
    return unreadConversations;
  };

  $scope.getPlaceDetailsForNewPlaceIds = function (conversations) {
    const placeIdsNotInPlaceLibrary = [];
    const placeButtonLayoutNotSetConversationIds = [];
    conversations.forEach(function (conversation) {
      const { placesLibrary } = $scope.chatLibrary;
      if (conversation.pinGame) {
        const pinGameId = conversation.pinGame.rootPlaceId;
        if (
          !chatUtility.isPlaceDetailQualifiedInLibrary(placesLibrary, pinGameId) &&
          placeIdsNotInPlaceLibrary.indexOf(pinGameId) < 0
        ) {
          placeIdsNotInPlaceLibrary.push(pinGameId);
        }
      }
      if (conversation.playTogetherIds && conversation.playTogetherIds.length > 0) {
        conversation.playTogetherIds.forEach(function (placeId) {
          if (
            !chatUtility.isPlaceDetailQualifiedInLibrary(placesLibrary, placeId) &&
            placeIdsNotInPlaceLibrary.indexOf(placeId) < 0
          ) {
            placeIdsNotInPlaceLibrary.push(placeId);
          }

          const conversationId = conversation.id;
          if (
            (!conversation.placeButtonLayout || !conversation.placeButtonLayout[placeId]) &&
            placeButtonLayoutNotSetConversationIds.indexOf(conversationId) < 0
          ) {
            placeButtonLayoutNotSetConversationIds.push(conversationId);
          }
        });
      }
    });

    if (placeIdsNotInPlaceLibrary.length > 0) {
      $scope.fetchPlaceDetailsIntoPlacesLibrary(placeIdsNotInPlaceLibrary, conversations);
    } else if (placeButtonLayoutNotSetConversationIds.length > 0) {
      const { placesLibrary } = $scope.chatLibrary;
      angular.forEach(conversations, function (conversation) {
        if (placeButtonLayoutNotSetConversationIds.indexOf(conversation.id) > -1) {
          gameService.buildButtonLayoutPerConversation(conversation, placesLibrary);
        }
      });
    }
  };

  $scope.isConversationExistedInViewModel = function (conversation) {
    if (conversation && conversation.layoutId) {
      const { layoutId } = conversation;
      return $scope.chatUserDict && $scope.chatUserDict[layoutId];
    }
    return false;
  };

  $scope.getIsUserPending = function (conversation) {
    if (
      $scope.chatLibrary.isTrustedCommsWebEnabled &&
      conversation.userPendingStatus === chatUtility.pendingStatus.PENDING
    ) {
      return true;
    }

    return false;
  };

  $scope.getIsConversationDisabledWithUser = function (conversation) {
    if (
      $scope.chatLibrary.isWebChatRegionalityEnabled ||
      $scope.chatLibrary.isWebChatSettingsMigrationEnabled
    ) {
      return conversation.participantPendingStatus === chatUtility.pendingStatus.PENDING;
    }

    return false;
  };

  $scope.buildChatUserListByConversations = function (conversations, addToFront) {
    const conversationIds = [];
    conversations.forEach(function (conversation) {
      if (conversation.source === 'friends') {
        if (!conversation || !conversation.participants) {
          return;
        }

        let friendId = null;
        conversation.participants.forEach(user => {
          const { id: userId } = user;
          if (userId !== $scope.chatLibrary.userId && !friendId) {
            friendId = userId;
          }
        });
        if (!friendId) {
          return;
        }

        conversation.id = friendId;
        conversation.dialogType = chatUtility.dialogType.FRIEND;
      }
      const layoutId = $scope.getLayoutId(conversation.id, conversation.dialogType);
      conversationIds.push(conversation.id);
      conversation.layoutId = layoutId;
      $scope.getUserInfoForConversation(conversation);
      conversation.isUserPending = $scope.getIsUserPending(conversation);
      conversation.isConversationUnavailableWithUser = $scope.getIsConversationDisabledWithUser(
        conversation
      );
      if (!$scope.isConversationExistedInViewModel(conversation)) {
        $scope.updateChatViewModel(conversation, addToFront);
      }
    });
    $scope.processLatestMessageForConversations(
      conversations.map(conversation => ({
        conversationId: conversation.id,
        messages: conversation.messages
      }))
    );
    $scope.getPlaceDetailsForNewPlaceIds(conversations);
  };

  $scope.openConversation = function () {
    const { layoutId } = $scope.chatLibrary.dialogRequestedToOpenParams;
    const { autoPop } = $scope.chatLibrary.dialogRequestedToOpenParams;
    if ($scope.chatUserDict[layoutId]) {
      // existing conversation
      $scope.updateDialogList(layoutId, autoPop);
      $scope.$evalAsync();
    }
  };

  /**
   * Creates a conversation with the given friendId, opens it, and maybe adds it to the front of the list.
   * To be used when:
   * - The user clicks chat on a friend's profile and the chat isn't in the state
   * - The user messages in a friend conversation for the first time
   */
  $scope.openConversationFromFriendId = function (friendId, addToFront) {
    addToFront =
      typeof addToFront === 'undefined' || typeof addToFront !== 'boolean' ? true : addToFront;
    return chatService.startOneToOneConversation(friendId).then(
      function (conversation) {
        const newLayoutId = $scope.getLayoutId(conversation.id, chatUtility.dialogType.CHAT);
        conversation.layoutId = newLayoutId;
        conversation.dialogType = chatUtility.dialogType.CHAT;
        conversation.chatMessages = [];
        conversation.isGroupChat =
          conversation.type === chatUtility.conversationType.multiUserConversation;
        $scope.getUserInfoForConversation(conversation);
        gameService.buildButtonLayoutPerConversation(
          conversation,
          $scope.chatLibrary.placesLibrary
        );
        $scope.updateChatViewModel(conversation, addToFront);
        if (conversation.pinGame) {
          const { rootPlaceId } = conversation.pinGame;
          $scope.fetchPlaceDetailsIntoPlacesLibrary([rootPlaceId], [conversation]);
        }
        chatUtility.updateFocusedDialog($scope.chatLibrary, newLayoutId);
        messageService.formatTimestampInConversation(conversation);
        return conversation;
      },
      function () {
        $log.debug(' ---- startOneToOneConversation ---- failed!');
      }
    );
  };

  $scope.destroyDialogLayout = function (layoutId) {
    const destroyId = `#${layoutId}`;
    angular.element(destroyId).empty();
  };

  $scope.deleteLayoutIdFromDialogList = function (layoutId) {
    const dialogList = $scope.chatLibrary.dialogIdList;
    const indicesToRemove = [];
    for (let i = 0; i < dialogList.length; i++) {
      if (dialogList[i] === layoutId) {
        indicesToRemove.push(i);
      }
    }
    if (indicesToRemove.length > 0) {
      for (let j = indicesToRemove.length - 1; j >= 0; j--) {
        $scope.chatLibrary.dialogIdList.splice(indicesToRemove[j], 1);
      }
      delete $scope.chatLibrary.dialogDict[layoutId];
    }
  };

  $scope.expandGameListInConversation = function (layoutId) {
    const conversation = $scope.chatUserDict[layoutId];
    if (
      $scope.chatLibrary.playTogetherLibrary &&
      $scope.chatLibrary.playTogetherLibrary[conversation.id]
    ) {
      const playTogetherLayout = $scope.chatLibrary.playTogetherLibrary[conversation.id].layout;
      playTogetherLayout.activeGamesList.isCollapsed = true;
    }
  };

  $scope.launchFromConversationList = layoutId => {
    $scope.sendChatLandingEvent(
      eventNames.chatLandingConversationClicked,
      diagActionList.ChatLandingConversationClickedWeb,
      layoutId
    );
    $scope.launchDialog(layoutId, false);
  };

  // autoPop will be true when the dialog generation is not from user click interaction
  $scope.launchDialog = function (layoutId, autoPop) {
    $scope.chatLibrary.dialogRequestedToOpenParams.layoutId = layoutId;
    $scope.chatLibrary.dialogRequestedToOpenParams.autoPop = autoPop;
    const conversation = $scope.chatUserDict[layoutId];
    if (
      $scope.chatLibrary.dialogIdList.indexOf(layoutId) < 0 &&
      layoutId === chatUtility.newGroup.layoutId
    ) {
      // new group chat
      $scope.updateDialogList(layoutId, autoPop);
      $scope.chatUserDict[chatUtility.newGroup.layoutId] = $scope.newGroup;
    } else if ($scope.chatLibrary.dialogIdList.indexOf(layoutId) < 0 && conversation) {
      // either conversation or friends
      $scope.openConversation();
      $scope.expandGameListInConversation(layoutId);
      if (!autoPop) {
        chatUtility.updateFocusedDialog($scope.chatLibrary, layoutId);
      }
    } else if (
      $scope.chatLibrary.dialogIdList.indexOf(layoutId) > -1 &&
      $scope.chatLibrary.dialogsLayout[layoutId]
    ) {
      // active dialog
      const dialogLayout = $scope.chatLibrary.dialogsLayout[layoutId];
      dialogLayout.focusMeEnabled = true;
      chatUtility.updateFocusedDialog($scope.chatLibrary, layoutId);
      if (dialogLayout.collapsed) {
        dialogLayout.collapsed = false;
        chatUtility.updateDialogsPosition($scope.chatLibrary);
      }
    }

    if (conversation && !autoPop) {
      messageService.markMessagesAsRead(
        conversation,
        $scope.chatLibrary.shouldRespectConversationHasUnreadMessageToMarkAsRead
      );
    }
  };

  $scope.closeDialog = function (layoutId) {
    const conversation = $scope.chatUserDict[layoutId];
    let scrollbarElm;
    let scrollbarObj;
    if (conversation) {
      scrollbarElm = chatUtility.getScrollBarSelector(conversation);
      scrollbarObj = angular.element(scrollbarElm);
    }
    const elmOfChatContainer = angular.element('#chat-main');

    if ($scope.chatLibrary.chatLayout.focusedLayoutId === layoutId) {
      chatUtility.updateFocusedDialog($scope.chatLibrary, null);
    }
    // remove from dialog order list
    $scope.deleteLayoutIdFromDialogList(layoutId);
    if (conversation && conversation.dialogType === chatUtility.dialogType.NEWGROUPCHAT) {
      conversation.selectedUserIds = [];
      conversation.selectedUsersDict = {};
      conversation.numberOfSelected = 0;
    }
    // destroy scrollbar event
    if (scrollbarObj && scrollbarObj.length > 0) {
      scrollbarObj.mCustomScrollbar('destroy');
    }
    // reset active status
    $scope.$broadcast('Roblox.Chat.MarkDialogInactive', { layoutId });

    // remove from user chat list and conversation data
    if (conversation) {
      const conversationId = conversation.id;
      if (
        $scope.chatLibrary.conversationsDict[conversationId] &&
        $scope.chatLibrary.conversationsDict[conversationId].remove
      ) {
        const layoutPosition = $scope.chatLibrary.chatLayoutIds.indexOf(layoutId);
        if (layoutPosition > -1 && conversation) {
          $scope.chatLibrary.chatLayoutIds.splice(layoutPosition, 1);
          delete $scope.chatUserDict[layoutId];
          if (angular.equals($scope.chatUserDict, {})) {
            $scope.chatLibrary.chatLayout.chatLandingEnabled = true;
          }
        }
        updateLayoutIdList(layoutId, true);
      } else {
        // clean up message object
        messageService.processMessages($scope.chatLibrary, conversation, null);
      }
    }

    // destroy dialog template
    $scope.destroyDialogLayout(layoutId);

    // retrieve the minimized dialog data and open dialog for it
    if ($scope.chatLibrary.minimizedDialogIdList.length > 0) {
      const addOnLayoutId = $scope.chatLibrary.minimizedDialogIdList.shift();
      delete $scope.chatLibrary.minimizedDialogData[addOnLayoutId];
      $scope.chatLibrary.dialogIdList.push(addOnLayoutId);
      $scope.chatLibrary.dialogDict[addOnLayoutId].isUpdated = true;
      $scope.chatLibrary.dialogDict[addOnLayoutId].updateStatus = chatUtility.dialogStatus.REPLACE;
    }
    chatClientStorageUtilityService.updateStorage(
      chatClientStorageUtilityService.storageDictionary.dialogIdList,
      $scope.chatLibrary.dialogIdList,
      $scope.chatLibrary.cookieOption
    );
    chatClientStorageUtilityService.updateStorage(
      chatClientStorageUtilityService.storageDictionary.dialogDict,
      $scope.chatLibrary.dialogDict,
      $scope.chatLibrary.cookieOption
    );

    // reset dialog layout
    if ($scope.chatLibrary.dialogsLayout && $scope.chatLibrary.dialogsLayout[layoutId]) {
      $scope.chatLibrary.dialogsLayout[layoutId].collapsed = false;
    }
    // clean up dialog layout
    delete $scope.chatLibrary.dialogsLayout[layoutId];
    chatClientStorageUtilityService.updateStorage(
      chatClientStorageUtilityService.storageDictionary.dialogsLayout,
      $scope.chatLibrary.dialogsLayout,
      $scope.chatLibrary.cookieOption
    );
  };

  $scope.validLayoutId = function (layoutId, dialogType) {
    if (!$scope.chatUserDict[layoutId]) {
      if ($scope.chatApiParams.loadMoreConversations) {
        $scope.getUserConversations();
      } else {
        $scope.chatLibrary.chatLayout.urlParseInitialized = true;
      }
      return false;
    }
    return true;
  };

  $scope.startSpecificConversationFromUserId = function (userId) {
    const layoutId = doesUserHavePrivateConversation(userId);
    if (layoutId && $scope.validLayoutId(layoutId, chatUtility.dialogType.CHAT)) {
      $scope.chatLibrary.chatLayout.urlParseInitialized = true;
      $scope.launchDialog(layoutId, true);
    } else {
      $scope.openConversationFromFriendId(userId);
    }
  };

  $scope.startSpecificConversationFromConvId = function (conversationId) {
    const layoutId = $scope.getLayoutId(conversationId, chatUtility.dialogType.CHAT);
    $log.debug(`--attempting to open specific conversation on load: ${conversationId}--`);
    if ($scope.validLayoutId(layoutId, chatUtility.dialogType.CHAT)) {
      $scope.chatLibrary.chatLayout.urlParseInitialized = true;
      $scope.launchDialog(layoutId);
    }
  };

  $scope.openSettingsPage = function () {
    window.location.href = urlService.getAbsoluteUrl(chatUtility.linksLibrary.settingLink);
  };

  $scope.getAvatars = function (userIds) {
    if (userIds && userIds.length > 0) {
      usersService.getAvatarHeadshots(userIds, $scope.chatLibrary.friendsDict);
    }
  };

  $scope.getFriendsInfo = friends => {
    if ($scope.chatLibrary.chatLayout.pageDataLoading) {
      $scope.chatLibrary.chatLayout.pageDataLoading = false;
    }
    if (friends?.length) {
      const userIds = [];
      angular.forEach(friends, friend => {
        const currentFriend = friend;
        const { id: userId } = currentFriend;
        userIds.push(userId);
        currentFriend.id = parseInt(userId, 10);
        currentFriend.userId = parseInt(userId, 10);
        const { name, display_name } = currentFriend;
        currentFriend.nameForDisplay = DisplayNames?.Enabled() ? display_name : name;
        if (!$scope.chatLibrary.friendsDict[userId]) {
          $scope.chatLibrary.friendsDict[userId] = currentFriend;
        }
      });
      $scope.getAvatars(userIds);
    }
  };

  $scope.initializeChat = function () {
    if (!$scope.chatUserDict || !$scope.chatLibrary) {
      $scope.setup();
    }
    performanceService.logSinglePerformanceMark(
      chatUtility.performanceMarkLabels.chatConversationsLoading
    );
    // initialize loading conversation count and chat user list
    $scope.updateUnreadConversationCount();
    // initialize the chat windows
    $scope.getUserConversations();
  };

  $scope.sendChatLandingEvent = function (eventName, counterName, layoutId) {
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }
      analyticsService.incrementCounter(counterName);

      const conversation = $scope.chatUserDict?.[layoutId] ?? {};
      const { hasUnreadMessages } = conversation;

      const { searchTerm } = $scope.chatViewModel ?? {};

      const eventProperties = {
        localTimestamp: Date.now(),
        isChatEnabled: $scope.getIsChatEnabled(),
        isFiltered: !!searchTerm,
        // excluding conversationListCount and selectedIndex for now because filtering is done with a directive
        selectedConversationId: analyticsService.getConversationIdForAnalytics(conversation),
        hasUnreadMessages: !!hasUnreadMessages
      };

      analyticsService.sendEvent(eventName, eventProperties);
    } catch (e) {
      $log.debug(`sendChatLandingEvent for Event ${eventName} failed: ${e}`);
    }
  };

  $scope.sendWebChatRenderedEvent = function () {
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }
      analyticsService.incrementCounter(diagActionList.WebChatRenderedWeb);

      const eventProperties = {
        localTimestamp: Date.now(),
        isChatEnabled: $scope.getIsChatEnabled(),
        isChatOpen: !$scope.chatLibrary?.chatLayout?.collapsed
      };

      analyticsService.sendEvent(eventNames.webChatRendered, eventProperties);
    } catch (e) {
      $log.debug(`sendWebChatRenderedEvent failed: ${e}`);
    }
  };

  $scope.sendWebChatConversationsLoadedEvent = function (webConversations) {
    try {
      if (!$scope.chatLibrary.shouldSendEvents) {
        return;
      }
      analyticsService.incrementCounter(diagActionList.WebChatConversationsLoadedWeb);

      const conversationIds = [];
      const friendsConversationIds = [];
      angular.forEach(webConversations, function (conversation) {
        const { id: conversationId, source, participant_user_ids: participantIds } = conversation;
        if (source === 'friends') {
          if (participantIds) {
            for (const participantId of participantIds) {
              if (participantId !== $scope.chatLibrary.userId) {
                friendsConversationIds.push(participantId);
                break;
              }
            }
          }
        } else if (conversationId) {
          conversationIds.push(conversationId);
        }
      });
      const stringifiedConversationIds = JSON.stringify(conversationIds);
      // having quotes in the stringified array will cause the string array field to be parsed with two quotes
      const conversationIdsNoQuotes = stringifiedConversationIds.replace(/"/g, '');

      const eventProperties = {
        localTimestamp: Date.now(),
        isChatOpen: !$scope.chatLibrary?.chatLayout?.collapsed,
        conversationIds: conversationIdsNoQuotes,
        friendsConversationIds: JSON.stringify(friendsConversationIds)
      };

      analyticsService.sendEvent(eventNames.webChatConversationsLoaded, eventProperties);
    } catch (e) {
      $log.debug(`sendWebChatConversationsLoaded failed: ${e}`);
    }
  };

  $scope.initializeEvents = function () {
    angular.element($window).bind('resize', function () {
      if (
        !$scope.chatLibrary.chatLayout.resizing &&
        ($scope.chatLibrary.dialogIdList.length > 0 ||
          $scope.chatLibrary.minimizedDialogIdList.length > 0)
      ) {
        $scope.chatLibrary.chatLayout.resizing = true;
        getDialogsNumber();
        if ($scope.dialogsOverflowWindow() || dialogsFitWindow()) {
          $log.debug(' ------- need to resize -------------- ');
          $scope.onResize();
        } else {
          $scope.chatLibrary.chatLayout.resizing = false;
        }
      }
    });

    $scope.$on('Roblox.Chat.destroyChatCookie', function () {
      chatClientStorageUtilityService.removeFromStorage(
        chatClientStorageUtilityService.storageDictionary.dialogIdList,
        $scope.chatLibrary.cookieOption
      );
      chatClientStorageUtilityService.removeFromStorage(
        chatClientStorageUtilityService.storageDictionary.dialogDict,
        $scope.chatLibrary.cookieOption
      );
      chatClientStorageUtilityService.removeFromStorage(
        chatClientStorageUtilityService.storageDictionary.dialogsLayout,
        $scope.chatLibrary.cookieOption
      );
      chatClientStorageUtilityService.removeFromStorage(
        chatClientStorageUtilityService.storageDictionary.chatBarLayout,
        $scope.chatLibrary.cookieOption
      );
      chatClientStorageUtilityService.removeFromStorage(
        chatClientStorageUtilityService.storageDictionary.chatFriendsListReloadTime
      );

      // remove localstorage
      localStorageService.removeLocalStorage($scope.chatLibrary.dialogLocalStorageName);
      storageService.clearLocalStorage();
    });

    $scope.$on('Roblox.Chat.LoadUnreadConversationCount', function () {
      $scope.updateUnreadConversationCount();
    });

    $document.bind('Roblox.Chat.StartChat', function (event, args) {
      $scope.startSpecificConversationFromUserId(args.userId);
    });
  };

  $scope.initializeServices = function (appData) {
    chatService.setParams();
    messageService.setParams(appData);
    gameService.setParams(EnvironmentUrls.gamesApi);
    storageService.setStorageParams(appData);
  };

  $scope.initializeLayoutLibrary = () => {
    const { thumbnailTypes, avatarHeadshotSize } = thumbnailConstants;
    $scope.chatLibrary.layoutLibrary = {
      thumbnailTypes,
      avatarHeadshotSize
    };
  };

  $scope.parseChatSettingsResponsesForChatEnabled = function (data) {
    const { metadataResponse, guacResponse } = data;
    $scope.chatLibrary.isWebChatSettingsMigrationEnabled =
      metadataResponse.isWebChatSettingsMigrationEnabled;
    $scope.chatLibrary.isWebChatRegionalityEnabled = metadataResponse.isWebChatRegionalityEnabled;
    if ($scope.chatLibrary.isWebChatSettingsMigrationEnabled) {
      $scope.chatLibrary.chatLayout.isGroupChatEnabled =
        metadataResponse.isGroupChatEnabledByPrivacySetting === 'enabled';
    }
    $scope.chatLibrary.chatLayout.isChatEnabledByPrivacySetting =
      metadataResponse.isChatEnabledByPrivacySetting === 'enabled';
    if ($scope.chatLibrary.isWebChatRegionalityEnabled) {
      if (angular.isDefined(guacResponse.CanUsePlatformChat)) {
        $scope.chatLibrary.chatLayout.isChatEnabledByRegion = guacResponse.CanUsePlatformChat;
      } else {
        $scope.chatLibrary.chatLayout.isChatEnabledByRegion =
          metadataResponse.isChatEnabledByGlobalRules === 'enabled';
      }
    }
    if (metadataResponse.isChatVisible !== false) {
      angular.element("#chat-container").show();
    }
    $scope.chatLibrary.chatLayout.isChatEnabled = metadataResponse.isChatEnabled;
    $scope.chatLibrary.chatLayout.languageForPrivacySettingUnavailable =
      metadataResponse.languageForPrivacySettingUnavailable;
  };

  // need to combine this with setup function after we rollout chat app site
  $scope.initializeChatLibrary = function (data) {
    const { metadataResponse, guacResponse } = data;
    const { domain } = EnvironmentUrls;
    $scope.parseChatSettingsResponsesForChatEnabled(data);
    $scope.chatLibrary.chatLayout.languageForPrivacySettingUnavailable =
      metadataResponse.languageForPrivacySettingUnavailable;
    $scope.chatLibrary.chatLayout.playTogetherGameCardsEnabled =
      metadataResponse.isPlayTogetherForGameCardsEnabled;
    $scope.chatLibrary.cookieOption = {
      domain,
      path: '/',
      expires: null
    };
    $scope.chatLibrary.currentTabTitle = $window.document.title;
    $scope.chatLibrary.dialogLocalStorageName =
      libraryInitialization.dialogLocalStorageNamePrefix + domain;
    $scope.chatLibrary.domain = domain;

    $scope.chatLibrary.isUserUnder13 = CurrentUser.isUnder13;
    $scope.chatLibrary.maxConversationTitleLengthInput =
      metadataResponse.maxConversationTitleLength;

    $scope.chatLibrary.partyChromeDisplayTimeStampInterval =
      metadataResponse.partyChromeDisplayTimeStampInterval;
    $scope.chatLibrary.quotaOfGroupChatMembers = metadataResponse.numberOfMembersForPartyChrome - 1;
    ($scope.chatLibrary.screenHeight = window.screen ? window.screen.height : 0),
      ($scope.chatLibrary.signalRDisconnectionResponseInMilliseconds =
        metadataResponse.signalRDisconnectionResponseInMilliseconds);
    $scope.chatLibrary.typingInChatAsSenderThrottleMs = metadataResponse.typingInChatFromSenderThrottleMs;
    $scope.chatLibrary.typingInChatForReceiverExpirationMs =
      metadataResponse.typingInChatForReceiverExpirationMs;

    $scope.chatLibrary.userId = parseInt(CurrentUser.userId);
    $scope.chatLibrary.usePaginatedFriends =
      $scope.chatLibrary.userId % 100 <= guacResponse.usePaginatedFriends;
    $scope.chatLibrary.username = CurrentUser.name;
    let eventAction = googleAnalyticsEventsService.eventActions.Chat;
    eventAction += `: ${googleAnalyticsEventsService.getUserAgent()}`;
    $scope.chatLibrary.googleAnalyticsEvent = {
      category: googleAnalyticsEventsService.eventCategories.JSErrors,
      action: eventAction
    };

    // initialize eventstream variable
    $scope.chatLibrary.eventStreamParams = { ...chatUtility.eventStreamParams };
    const webChatEventSampleRate = metadataResponse.webChatEventSampleRate ?? 0;
    $scope.chatLibrary.shouldSendEvents = Math.random() * 100 <= webChatEventSampleRate;

    $scope.chatLibrary.relativeValueToRecordUiPerformance =
      metadataResponse.relativeValueToRecordUiPerformance;
    $scope.chatLibrary.isUsingCacheToLoadFriendsInfoEnabled =
      metadataResponse.isUsingCacheToLoadFriendsInfoEnabled;
    $scope.chatLibrary.cachedDataFromLocalStorageExpirationMS =
      metadataResponse.cachedDataFromLocalStorageExpirationMS;
    $scope.chatLibrary.shouldRespectConversationHasUnreadMessageToMarkAsRead =
      metadataResponse.shouldRespectConversationHasUnreadMessageToMarkAsRead;
    $scope.chatLibrary.isTrustedCommsWebEnabled = metadataResponse.isTrustedCommsWebEnabled;
    $scope.chatLibrary.isPendingLabelEnabled =
      $scope.chatLibrary.isWebChatSettingsMigrationEnabled ||
      $scope.chatLibrary.isTrustedCommsWebEnabled;

    $scope.initializeLayoutLibrary();
  };

  $scope.getIsChatEnabled = function() {
    return chatUtility.getIsChatEnabled($scope.chatLibrary);
  };
  $scope.getIsGroupChatEnabled = function() {
    return chatUtility.getIsGroupChatEnabled($scope.chatLibrary);
  };
  $scope.getChatDisabledReason = function() {
    return chatUtility.getChatDisabledReasonsByPriority($scope.chatLibrary)?.[0];
  };

  $scope.maybeCloseNewGroupDialog = function() {
    const newGroupLayoutId = $scope.newGroup?.layoutId;
    const dialogDict = $scope.chatLibrary?.dialogDict;
    if (!$scope.getIsGroupChatEnabled() && newGroupLayoutId && dialogDict?.[newGroupLayoutId]) {
      $scope.closeDialog(newGroupLayoutId);
    }
  };

  $scope.initializeChatViewModel = function () {
    $scope.chatViewModel = { ...libraryInitialization.chatViewModel };
  };
  $scope.bootstrapAllInitialization = function (data) {
    const { metadataResponse } = data;
    // start populating page data
    $scope.initializeChatViewModel();
    $scope.initializeChatLibrary(data); // popluate page data into chat library for display
    $scope.initializeServices(metadataResponse); // populate page data into services to initialize params there
    $scope.initializeRealTimeSubscriptionsForUserSetttingsChanged(); // get privacy setting
    $scope.initializePresetData(); // preload data from localstorage and set up api endpoint params
    $scope.initializeChatBar(); // initialize chat conversation UI
    // data initializing
    if ($scope.getIsChatEnabled()) {
      $scope.chatLibrary.chatLayout.pageDataLoading = true;
      $scope.initializeChat();
      $scope.initializeRealTimeSubscriptionsForChat();
    }
    if ($scope.chatLibrary.chatLayout.pageInitializing) {
      $scope.chatLibrary.chatLayout.pageInitializing = false;
    }
    $scope.sendWebChatRenderedEvent();
  };

  const getPromiseResultOrEmptyObject = promiseResult => {
    return promiseResult.status === 'fulfilled' ? promiseResult.value ?? {} : {};
  };

  $scope.fetchAllWebChatSettings = function () {
    const promises = [chatService.getMetaData(), guacService.getChatUiPolicies()];

    return Promise.allSettled(promises).then(([metadataResult, guacResult]) => {
      return {
        metadataResponse: getPromiseResultOrEmptyObject(metadataResult),
        guacResponse: getPromiseResultOrEmptyObject(guacResult)
      };
    });
  };

  $scope.initialize = function () {
    $scope.setup(); // set variables into scope
    $scope.initializeEvents();
    $scope.chatLibrary.chatLayout.pageInitializing = true;

    const promises = [
      $scope
        .fetchAllWebChatSettings()
        .then(data => {
          $scope.bootstrapAllInitialization(data);
        })
        .catch(error => {
          $log.debug(error);
        }),
      contactsService
        .getContactsMetaData()
        .then(() => {})
        .catch(error => {
          $log.debug(error);
        })
    ];
    return Promise.all(promises);
  };

  $scope.initialize();
}

chatModule.controller('chatController', chatController);

export default chatController;
