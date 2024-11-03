import chatModule from '../chatModule';

function chatBarController($scope, $log, chatClientStorageUtilityService, chatUtility) {
  'ngInject';

  $scope.cancelSearch = () => {
    $scope.chatViewModel.searchTerm = '';
    $scope.chatLibrary.chatLayout.searchFocus = false;
  };

  $scope.saveChatBarLayoutInCookie = function () {
    const chatBarLayout = {
      collapsed: $scope.chatLibrary.chatLayout.collapsed
    };
    chatClientStorageUtilityService.updateStorage(
      chatClientStorageUtilityService.storageDictionary.chatBarLayout,
      chatBarLayout,
      $scope.chatLibrary.cookieOption
    );
  };

  $scope.toggleChatContainer = function () {
    $scope.chatLibrary.chatLayout.collapsed = !$scope.chatLibrary.chatLayout.collapsed;
    $scope.updateUnreadConversationCount();
    $scope.chatLibrary.chatLayout.chatBarInitialized = true;
    $scope.saveChatBarLayoutInCookie();
  };

  $scope.isChatDisconnected = function () {
    const {
      chatLayout: { errorMaskEnable, pageDataLoading }
    } = $scope.chatLibrary;
    return $scope.getIsChatEnabled() && (errorMaskEnable || pageDataLoading);
  };

  $scope.isChatEmpty = function () {
    const {
      chatLayout: { chatLandingEnabled }
    } = $scope.chatLibrary;
    return chatLandingEnabled || !$scope.getIsChatEnabled();
  };

  $scope.getIsChatEnabled = function() {
    return chatUtility.getIsChatEnabled($scope.chatLibrary);
  };

  $scope.search = item => {
    const { searchTerm } = $scope.chatViewModel;
    if (!searchTerm) {
      return true;
    }
    const { name, contact, participants, title } = item;
    const searchTermLowerCase = searchTerm.toLowerCase();
    let isSearchMatchedInParticipants = false;
    if (participants && participants.length) {
      isSearchMatchedInParticipants = participants.some(participant => {
        const { display_name, name: participantName } = participant;
        return (
          (display_name && display_name.toLowerCase().indexOf(searchTermLowerCase) > -1) ||
          participantName.toLowerCase().indexOf(searchTermLowerCase) > -1
        );
      });
    }

    return (
      isSearchMatchedInParticipants ||
      name.toLowerCase().indexOf(searchTermLowerCase) !== -1 ||
      title.toLowerCase().indexOf(searchTermLowerCase) !== -1 ||
      (contact && contact.toLowerCase().indexOf(searchTermLowerCase) !== -1)
    );
  };
}

chatModule.controller('chatBarController', chatBarController);

export default chatBarController;
