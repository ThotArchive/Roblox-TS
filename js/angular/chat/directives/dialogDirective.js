import angular from 'angular';
import { UserProfileField } from 'roblox-user-profiles';
import chatModule from '../chatModule';

function dialog(
  $window,
  $compile,
  $templateCache,
  $filter,
  chatUtility,
  chatClientStorageUtilityService,
  localStorageService,
  messageService,
  resources,
  gameService,
  gameLayout,
  friendsService,
  userProfilesService,
  usersService,
  $log
) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      dialogData: '=',
      chatLibrary: '=',
      chatUser: '=',
      timeoutExpiresAt: '@',
      showTimeoutModal: '&',
      closeDialog: '&',
      sendInvite: '&',
      openConversationFromFriendId: '&',
      updateFriendsDictBySearch: '&'
    },
    link(scope, element, attrs) {
      const { limitMemberDisplay } = chatUtility.dialogLayout;
      let intervalCount = 0;
      let previousCursor = '';
      const searchDebounceTime = 250;

      const loadScope = function () {
        scope.isOverLoaded();
        scope.dialogData.currentUserId = scope.currentUserId;
        const { dialogTemplate } = resources.templates;
        const { groupDialogTemplate } = resources.templates;
        const newGroupTemplate = resources.templates.createChatGroupTemplate;
        switch (scope.dialogData.dialogType) {
          case chatUtility.dialogType.CHAT:
            var userId;
            angular.forEach(scope.dialogData.userIds, function (id) {
              if (id !== scope.chatLibrary.userId) {
                userId = id;
              }
            });
            scope.dialogLayout.title = scope.dialogData.title;
            scope.dialogLayout.templateUrl = dialogTemplate;
            scope.dialogLayout.scrollbarElm = chatUtility.getScrollBarSelector(
              scope.dialogData,
              chatUtility.scrollBarType.MESSAGE
            );
            scope.dialogData.name = scope.dialogData.title;
            scope.dialogData.nameLink = scope.chatLibrary.friendsDict[userId]
              ? scope.chatLibrary.friendsDict[userId].profileUrl
              : '';
            break;
          case chatUtility.dialogType.GROUPCHAT:
            scope.dialogLayout.templateUrl = groupDialogTemplate;
            scope.dialogLayout.limitMemberDisplay = limitMemberDisplay;
            scope.dialogLayout.scrollbarElm = chatUtility.getScrollBarSelector(
              scope.dialogData,
              chatUtility.scrollBarType.MESSAGE
            );
            scope.dialogData.name = scope.dialogData.title;
            break;
          case chatUtility.dialogType.NEWGROUPCHAT:
            scope.dialogLayout.title = scope.dialogData.title;
            scope.dialogLayout.templateUrl = newGroupTemplate;
            break;
        }

        scope.updateDialogStyle();
      };

      const destroyChildScope = function () {
        let validTimeStamp;
        if (scope.chatLibrary && scope.chatLibrary.dialogScopeLib[scope.dialogData.id]) {
          validTimeStamp = scope.chatLibrary.dialogScopeLib[scope.dialogData.id];
        }
        if (
          scope.$$childHead &&
          scope.$$childHead != null &&
          scope.$$childHead.timeStamp === validTimeStamp
        ) {
          scope.$$childHead.$destroy();
        }
      };

      const loadTemplate = function () {
        if (scope.dialogLayout.IsdialogContainerVisible || element.find('.dialog-container')) {
          scope.dialogLayout.IsdialogContainerVisible = false;
          element.empty();
        }
        const dialogTemplate = angular.element($templateCache.get(scope.dialogLayout.templateUrl));

        destroyChildScope();

        const newScope = scope.$new();
        const timeStamp = Date.now();
        if (scope.chatLibrary) {
          scope.chatLibrary.dialogScopeLib[scope.dialogData.id] = timeStamp;
        }
        newScope.timeStamp = timeStamp;
        const lfn = $compile(dialogTemplate);
        element.append(dialogTemplate);
        lfn(newScope);
      };

      const isTextSelected = function () {
        let text = '';
        if (angular.isDefined(window.getSelection)) {
          text = window.getSelection().toString();
        } else if (
          angular.isDefined(window.document.selection) &&
          window.document.selection.type === 'Text'
        ) {
          text = window.document.selection.createRange().text;
        }
        return text.length > 0;
      };

      const updatePosition = function (list) {
        const { layoutId } = scope.dialogData;
        const idOfDialog = `#${layoutId}`;
        const { chatLayout } = scope.chatLibrary;
        const dialogElm = angular
          .element(document.querySelector(idOfDialog))
          .find('.dialog-container');
        const widthOfChatContainer = chatLayout.widthOfChat;
        const widthOfDialog = chatLayout.widthOfDialog + chatLayout.spaceOfDialog;
        const indexPositionOfDialog = list.indexOf(layoutId);
        const library = scope.chatLibrary;
        const widthOfDialogs = chatUtility.calculateRightPosition(library, indexPositionOfDialog);

        const right = +widthOfChatContainer + widthOfDialogs + chatLayout.spaceOfDialog;
        // get current window size
        const widthOfWindow = $window.innerWidth;
        if (widthOfWindow < right + widthOfDialog) {
          var zIndex = +chatLayout.defaultChatZIndex + 1;
          dialogElm.css('z-index', zIndex);
        } else {
          var zIndex = +chatLayout.defaultChatZIndex + indexPositionOfDialog;
          chatUtility.updateDialogsPosition(library);
          dialogElm.css('z-index', zIndex);
        }
        dialogElm.addClass('dialog-visible');
      };

      const saveDialogStatusInCookie = function () {
        chatClientStorageUtilityService.updateStorage(
          chatClientStorageUtilityService.storageDictionary.dialogIdList,
          scope.chatLibrary.dialogIdList,
          scope.chatLibrary.cookieOption
        );
        chatClientStorageUtilityService.updateStorage(
          chatClientStorageUtilityService.storageDictionary.dialogDict,
          scope.chatLibrary.dialogDict,
          scope.chatLibrary.cookieOption
        );
      };

      scope.saveIntoDialogsLayout = function () {
        const { layoutId } = scope.dialogData;
        if (scope.dialogLayout && scope.dialogLayout.layoutId === layoutId) {
          scope.chatLibrary.dialogsLayout[layoutId] = scope.dialogLayout;
          chatClientStorageUtilityService.updateStorage(
            chatClientStorageUtilityService.storageDictionary.dialogsLayout,
            scope.chatLibrary.dialogsLayout,
            scope.chatLibrary.cookieOption
          );
        }
      };

      const isFriendNonMember = function (friendId) {
        const currentUserPosition = angular.isDefined(scope.dialogData.userIds)
          ? scope.dialogData.userIds.indexOf(friendId)
          : -1;
        const selectedUserPosition = angular.isDefined(scope.dialogData.selectedUserIds)
          ? scope.dialogData.selectedUserIds.indexOf(friendId)
          : -1;
        return currentUserPosition < 0 && selectedUserPosition < 0;
      };

      // dialogLibrary is used for chat dialogs in each tab status
      const getDialogLibrary = function () {
        scope.dialogLibrary = !localStorageService.getLocalStorage(
          scope.chatLibrary.dialogLocalStorageName
        )
          ? {}
          : localStorageService.getLocalStorage(scope.chatLibrary.dialogLocalStorageName);
      };

      const getActiveStatusFromLocalStorage = function () {
        return (
          scope.dialogLibrary &&
          scope.dialogLibrary[scope.dialogData.layoutId] &&
          scope.dialogLibrary[scope.dialogData.layoutId].active
        );
      };

      const getInactiveStatusFromLocalStorage = function () {
        return (
          scope.dialogLibrary &&
          scope.dialogLibrary[scope.dialogData.layoutId] &&
          !scope.dialogLibrary[scope.dialogData.layoutId].active
        );
      };

      const init = function () {
        scope.dialogData.friendIds = scope.chatLibrary.friendIds
          ? scope.chatLibrary.friendIds.slice()
          : [];
        scope.dialogMessages = [];
        scope.dialogType = { ...chatUtility.dialogType };
        scope.dialogBannerTypes = { ...chatUtility.dialogBannerTypes };
        scope.dialogLayout = angular.isDefined(
          scope.chatLibrary.dialogsLayout[scope.dialogData.layoutId]
        )
          ? scope.chatLibrary.dialogsLayout[scope.dialogData.layoutId]
          : angular.copy(chatUtility.dialogLayout);
        scope.dialogLayout.layoutId = scope.dialogData.layoutId;
        scope.toastLayout = {
          isEnabled: scope.dialogLayout.isMembersOverloaded,
          timeout: scope.dialogLayout.memberDisplay.timeoutToast
        };
        scope.dialogLayout.defaultStyle = {};
      };

      // // ----------------------------------- PUBLIC ---------------------------------
      scope.updateDialogStyle = function () {
        chatUtility.updateDialogStyle(scope.dialogData, scope.dialogLayout, scope.chatLibrary);
      };

      scope.updateFriends = function (data, search) {
        // friend Ids library exist
        const candidateFriendIds = [];
        if (!data) {
          const friendIds = scope.chatLibrary.friendIds.slice();
          angular.forEach(friendIds, function (friendId) {
            // remove existing user from friendIs;
            if (isFriendNonMember(friendId)) {
              candidateFriendIds.push(friendId);
            }
          });
          scope.dialogData.friendIds =
            search || !scope.chatLibrary.usePaginatedFriends
              ? candidateFriendIds
              : [...new Set(scope.dialogData.friendIds.concat(candidateFriendIds))];
        } else {
          // get the friends or more data;
          let friends = !scope.chatLibrary.usePaginatedFriends
            ? chatUtility.sortFriendList(scope.chatLibrary, data)
            : null;
          if (friends || scope.chatLibrary.usePaginatedFriends) {
            if (scope.chatLibrary.usePaginatedFriends) {
              friends = data;
            }
            friends.forEach(function (friend) {
              if (isFriendNonMember(friend.id)) {
                candidateFriendIds.push(friend.id);
              }
              if (!scope.chatLibrary.friendsDict[friend.id]) {
                scope.chatLibrary.friendsDict[friend.id] = friend;
              }
            });
            scope.dialogData.friendIds =
              search || !scope.chatLibrary.usePaginatedFriends
                ? candidateFriendIds
                : [...new Set(scope.dialogData.friendIds.concat(candidateFriendIds))];
          }
        }
      };

      // verify number of member is overloaded
      scope.isOverLoaded = function () {
        if (angular.isUndefined(scope.dialogData.selectedUserIds)) {
          scope.dialogData.selectedUserIds = [];
          scope.dialogData.selectedUsersDict = {};
        }
        if (scope.dialogData.dialogType !== chatUtility.dialogType.FRIEND) {
          if (scope.dialogData.dialogType === chatUtility.dialogType.NEWGROUPCHAT) {
            scope.dialogData.numberOfSelected = scope.dialogData.selectedUserIds.length;
          } else if (scope.dialogData.dialogType === chatUtility.dialogType.CHAT) {
            scope.dialogData.numberOfSelected =
              scope.dialogData.userIds.length + scope.dialogData.selectedUserIds.length; // decrease both user in 1:1
          } else {
            scope.dialogData.numberOfSelected =
              scope.dialogData.userIds.length + scope.dialogData.selectedUserIds.length - 1; // decrease myself
          }
          scope.dialogLayout.isMembersOverloaded =
            scope.dialogData.numberOfSelected >= scope.chatLibrary.quotaOfGroupChatMembers;
        }
      };

      scope.dialogData.selectedUserIds = [];
      scope.dialogData.selectedUsersDict = {};
      // used for legacy select friends
      scope.selectFriends = function (userId) {
        const position = scope.dialogData.selectedUserIds.indexOf(userId);
        if (position < 0 && !scope.dialogLayout.isMembersOverloaded) {
          // not existing
          scope.dialogData.selectedUserIds.push(userId);
          scope.dialogData.selectedUsersDict[userId] = angular.copy(
            scope.chatLibrary.friendsDict[userId]
          );
        } else if (position > -1) {
          scope.dialogData.selectedUserIds.splice(position, 1);
          delete scope.dialogData.selectedUsersDict[userId];
        }
        scope.dialogData.searchTerm = '';
        scope.isOverLoaded();
      };

      // reskin
      scope.isNumberOfMemberOverloaded = function () {
        const numberOfSelectedUsers = scope.dialogData.selectedUserIds
          ? scope.dialogData.selectedUserIds.length
          : 0;
        let numberOfExistingUsers = 0;
        if (scope.dialogData.userIds) {
          numberOfExistingUsers =
            scope.dialogData.dialogType === chatUtility.dialogType.CHAT
              ? scope.dialogData.userIds.length
              : scope.dialogData.userIds.length - 1;
        }
        if (
          numberOfSelectedUsers + numberOfExistingUsers >=
          scope.chatLibrary.quotaOfGroupChatMembers
        ) {
          scope.dialogLayout.isMembersOverloaded = true;

          if (
            scope.dialogLayout.details.isEnabled ||
            scope.dialogData.dialogType === chatUtility.dialogType.NEWGROUPCHAT
          ) {
            scope.toastLayout.isNeeded = true;
            if (!scope.toastLayout.text) {
              scope.toastLayout.text = scope.dialogLayout.memberDisplay.toastText(
                scope.chatLibrary.quotaOfGroupChatMembers
              );
            }
          }
          return true;
        }
        return false;
      };

      scope.toggleFriendSelection = function (userId, event) {
        if (event) {
          event.preventDefault();
        }
        const position = scope.dialogData.selectedUserIds.indexOf(userId);
        if (position < 0 && !scope.isNumberOfMemberOverloaded()) {
          // not existing
          scope.dialogData.selectedUserIds.push(userId);
          scope.dialogData.selectedUsersDict[userId] = angular.copy(
            scope.chatLibrary.friendsDict[userId]
          );
          scope.dialogData.selectedUsersDict[userId].isSelected = true;
        } else if (position > -1) {
          scope.dialogData.selectedUserIds.splice(position, 1);
          delete scope.dialogData.selectedUsersDict[userId];
        }
        scope.dialogData.searchTerm = '';
        scope.isOverLoaded();
      };

      scope.toggleDialogContainer = function () {
        scope.dialogLayout.collapsed = !scope.dialogLayout.collapsed;
        scope.toggleDialogFocusStatus(!scope.dialogLayout.collapsed);
        scope.saveIntoDialogsLayout();
        chatUtility.updateDialogsPosition(scope.chatLibrary);
      };

      scope.toggleDialogFocusStatus = function (status) {
        if (status) {
          chatUtility.updateFocusedDialog(scope.chatLibrary, scope.dialogData.layoutId);
          messageService.markMessagesAsRead(
            scope.dialogData,
            scope.chatLibrary.shouldRespectConversationHasUnreadMessageToMarkAsRead
          );
        }
        scope.dialogLayout.hasFocus = status;
        if (status && scope.dialogLayout.active) {
          scope.markInactive();
        }

        // can not be input box selected
        // can not be in app
        // can not be minimized status
        const focusMeEnabled =
          status &&
          !isTextSelected() &&
          !scope.dialogLayout.collapsed &&
          !scope.dialogLayout.renameEditor.isEnabled;
        scope.dialogLayout.focusMeEnabled = focusMeEnabled;
        scope.saveIntoDialogsLayout();
        return false;
      };

      scope.getTitle = function (activeType) {
        let title;
        let username;
        const message = scope.dialogData.chatMessages;
        if (message && message.length > 0) {
          const userId = message[0].sender_user_id;
          if (!userId) {
            // need to remove this feature
            return false;
          }
          username = scope.chatLibrary.friendsDict[userId].name;
        } else {
          username = scope.dialogData.initiator.name;
        }
        title = $filter('formatString')(chatUtility.chatLayout.defaultTitleForMessage, {
          userName: username
        });
        scope.title = title;
      };

      scope.changeTitle = function () {
        $window.document.title =
          intervalCount % 2 === 0 ? scope.title : scope.chatLibrary.currentTabTitle;
        intervalCount++;
      };

      scope.markInactive = function () {
        if (scope.dialogLayout.active) {
          scope.dialogLayout.active = false;

          getDialogLibrary();
          if (getActiveStatusFromLocalStorage()) {
            $log.debug(' --------------- markInactive -------------- set into local storage');
            if (angular.isUndefined(scope.dialogLibrary[scope.dialogData.layoutId])) {
              scope.dialogLibrary[scope.dialogData.layoutId] = {};
            }
            scope.dialogLibrary[scope.dialogData.layoutId].active = false;
            scope.dialogLibrary[scope.dialogData.layoutId].played = false;
            localStorageService.setLocalStorage(
              scope.chatLibrary.dialogLocalStorageName,
              scope.dialogLibrary
            );
          }
        }
      };

      scope.markActive = function (activeType) {
        getDialogLibrary();

        if (angular.isUndefined(scope.dialogLibrary[scope.dialogData.layoutId])) {
          scope.dialogLibrary[scope.dialogData.layoutId] = {};
        }
        scope.dialogLibrary[scope.dialogData.layoutId].active = true;
        scope.dialogLibrary[scope.dialogData.layoutId].played = false;
        localStorageService.setLocalStorage(
          scope.chatLibrary.dialogLocalStorageName,
          scope.dialogLibrary
        );

        if (
          scope.dialogLayout.collapsed ||
          scope.chatLibrary.chatLayout.focusedLayoutId !== scope.dialogData.layoutId
        ) {
          scope.dialogLayout.active = true;
          if (scope.dialogLayout.focusMeEnabled) {
            scope.dialogLayout.focusMeEnabled = false;
          }
        }
      };

      scope.handleLocalStorage = function (event) {
        if (event.key === scope.chatLibrary.dialogLocalStorageName) {
          getDialogLibrary();
          if (scope.dialogLayout.active && getInactiveStatusFromLocalStorage()) {
            scope.markInactive();
          }
        }
      };

      scope.checkNewGenerationDialogStatus = function () {
        if (scope.dialogData.isRenameEditorNeeded) {
          if (scope.dialogLayout.focusMeEnabled) {
            scope.dialogLayout.focusMeEnabled = false; // turn off dialog message input auto focus
          }
          scope.dialogData.isRenameEditorNeeded = false;
          scope.dialogLayout.renameEditor.isEnabled = true;
          scope.dialogLayout.renameEditor.hasFocus = true;
        }
      };

      let timer;
      scope.searchFriends = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (scope.dialogData.searchTerm.length !== 0) {
            scope.chatLibrary.chatLayout.isFriendsLoading = true;
            friendsService
              .searchFriends(scope.chatLibrary.userId, scope.dialogData.searchTerm)
              .then(
                result => {
                  if (result?.PageItems.length) {
                    scope.updateFriendsDictBySearch({
                      friends: result.PageItems
                    });
                    scope.updateFriends(result.PageItems, true);
                    scope.chatLibrary.chatLayout.isFriendsLoading = false;
                    previousCursor = scope.chatLibrary.currentFriendCursor;
                    scope.chatLibrary.currentFriendCursor = result.NextCursor;
                  }
                },
                error => {
                  console.debug(error);
                }
              );
          } else {
            scope.updateFriends(Object.values(scope.chatLibrary.friendsDict), true);
            scope.chatLibrary.currentFriendCursor = previousCursor;
            scope.$apply();
          }
        }, searchDebounceTime);
      };

      scope.search = function (item) {
        if (!scope.chatLibrary.usePaginatedFriends) {
          const { searchTerm } = scope.dialogData;
          if (!searchTerm) {
            return true;
          }
          const { name, contact, display_name, nameForDisplay } = item;
          const searchTermLowerCase = searchTerm.toLowerCase();

          return (
            name.toLowerCase().indexOf(searchTermLowerCase) !== -1 ||
            (display_name && display_name.toLowerCase().indexOf(searchTermLowerCase) !== -1) ||
            (contact && contact.toLowerCase().indexOf(searchTermLowerCase) !== -1) ||
            (nameForDisplay && nameForDisplay.toLowerCase().indexOf(searchTermLowerCase) !== -1)
          );
        }
      };

      scope.refreshShowTimedOutInputBar = function () {
        scope.showTimedOutInputBar = scope.timeoutExpiresAt && Date.now() < parseInt(scope.timeoutExpiresAt);
      };
      scope.refreshShowTimedOutInputBar();
      scope.$watch('timeoutExpiresAt', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.refreshShowTimedOutInputBar();
        }
      });

      // // ----------------------------------- CODE TO RUN --------------------------------
      init();
      scope.isOverLoaded();

      scope.$watch(
        function () {
          return scope.chatLibrary.dialogDict;
        },
        function (newValue, oldValue) {
          if (
            angular.isDefined(newValue) &&
            angular.isDefined(newValue[scope.dialogData.layoutId])
          ) {
            // $log.debug("------ watch dialogDict ----- update on scope.dialogData.layoutId : " + scope.dialogData.layoutId);
            const { layoutId } = scope.dialogData;
            const { chatLibrary } = scope;
            const position = chatLibrary.dialogIdList.indexOf(layoutId);
            const currentDialog = newValue[layoutId];
            const previousDialog = oldValue[layoutId];

            if (!previousDialog || currentDialog.isUpdated) {
              if (angular.isDefined(scope.chatLibrary.dialogsLayout[scope.dialogData.layoutId])) {
                scope.dialogLayout = scope.chatLibrary.dialogsLayout[scope.dialogData.layoutId];
              } else if (angular.isUndefined(scope.dialogLayout)) {
                scope.dialogLayout = angular.copy(chatUtility.dialogLayout);
              } else if (
                currentDialog.updateStatus === chatUtility.dialogStatus.INIT &&
                scope.dialogLayout
              ) {
                scope.dialogLayout.renameEditor = {
                  ...chatUtility.dialogLayout.renameEditor
                };
              }

              currentDialog.isUpdated = false;
              switch (currentDialog.updateStatus) {
                case chatUtility.dialogStatus.REPLACE:
                  if (position > -1) {
                    // uncollapse tab only if replacing chat tab with a tab being opened from the minimized chat section
                    if (scope.dialogLayout.collapsed) {
                      scope.dialogLayout.collapsed = false;
                    }
                    // this prevents the uncollapsing from occurring
                    // on a previously restored (REPLACE status) dialog that has been collapsed
                    currentDialog.updateStatus = chatUtility.dialogStatus.INIT;
                    scope.toggleDialogFocusStatus(true);
                  }
                case chatUtility.dialogStatus.INIT:
                  if (position > -1) {
                    // only load template when it is part of dialogIdList which is the list of open dialogs
                    // Whenever the auto open dialog happens, dialog will be not set focus as default
                    if (scope.dialogLayout.focusMeEnabled === currentDialog.autoOpen) {
                      scope.dialogLayout.focusMeEnabled = !currentDialog.autoOpen;
                    }
                    scope.checkNewGenerationDialogStatus();
                    loadScope();
                    loadTemplate();
                  }
                  break;
                case chatUtility.dialogStatus.MINIMIZE:
                  loadScope();
                  if (scope.chatLibrary.minimizedDialogIdList.indexOf(layoutId) < 0) {
                    scope.chatLibrary.minimizedDialogIdList.push(layoutId);
                    scope.chatLibrary.minimizedDialogData[layoutId] = scope.dialogData;
                  }
                  element.empty();
                  break;
                case chatUtility.dialogStatus.REFRESH:
                  loadScope();
                  currentDialog.updateStatus = chatUtility.dialogStatus.INIT;
                  break;
              }
            }

            saveDialogStatusInCookie();
            scope.saveIntoDialogsLayout();
            if (position > -1) {
              updatePosition(chatLibrary.dialogIdList);

              if (currentDialog.markAsActive) {
                scope.markActive(currentDialog.activeType);
                currentDialog.markAsActive = false;
              }
            }
          }
        },
        true
      );

      scope.$on('Roblox.Chat.MarkDialogInactive', function (event, args) {
        if (args.layoutId === scope.dialogData.layoutId) {
          scope.markInactive();
        }
      });

      localStorageService.listenLocalStorage(scope.handleLocalStorage);
    }
  };
}

chatModule.directive('dialog', dialog);

export default dialog;
