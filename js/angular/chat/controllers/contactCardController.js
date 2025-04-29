import angular from 'angular';
import chatModule from '../chatModule';

function contactCardController($scope, $log, chatService, chatUtility, profileInsightsService) {
  'ngInject';

  if (!$scope.chatLibrary.isWebChatTcEnabled) {
    return;
  }

  $scope.shouldShowInsightOfType = insightType =>
    angular.isDefined(
      $scope.chatLibrary.friendsDict[$scope.getOneToOneFriendId()]?.profileInsights?.[insightType]
    );

  $scope.getInsightTextOfType = insightType => {
    switch (insightType) {
      case 'numMutualFriends':
        return `${
          $scope.chatLibrary.friendsDict[$scope.getOneToOneFriendId()]?.profileInsights
            ?.numMutualFriends
        } mutual connections`;
      default:
        return '';
    }
  };

  const processProfileInsights = insights => {
    if (!insights || !Array.isArray(insights)) {
      return;
    }

    const processedInsights = {};

    insights.forEach(insight => {
      if (insight.mutualFriendInsight) {
        processedInsights.numMutualFriends = Object.keys(
          insight.mutualFriendInsight.mutualFriends ?? {}
        ).length;
      }
    });

    return processedInsights;
  };

  const fetchProfileInsightsForUser = userId => {
    profileInsightsService.getProfileInsights(userId).then(insightsForUser => {
      const processedInsights = processProfileInsights(insightsForUser);
      $scope.chatLibrary.friendsDict[
        $scope.getOneToOneFriendId()
      ].profileInsights = processedInsights;
    });
  };

  const maybeFetchProfileInsights = () => {
    const userId = $scope.getOneToOneFriendId();
    if ($scope.dialogLayout?.currentDialogScreen !== 'contactCard' || !userId) {
      return;
    }

    fetchProfileInsightsForUser(userId);
  };

  $scope.$watchGroup(['dialogLayout.currentDialogScreen', 'getOneToOneFriendId()'], () => {
    maybeFetchProfileInsights();
  });
}

chatModule.controller('contactCardController', contactCardController);

export default contactCardController;
