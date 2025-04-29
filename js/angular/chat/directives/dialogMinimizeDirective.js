import { BootstrapWidgets } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function dialogMinimize(chatUtility, resources, $log) {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      chatLibrary: '='
    },
    templateUrl: resources.templates.dialogMinimizeTemplate,
    link(scope, element, attrs) {
      var updatePosition = function() {
        let {chatLayout} = scope.chatLibrary;
        let numberOfOpenDialogs = scope.chatLibrary.dialogIdList.length;
        let widthOfChatContainer = chatLayout.widthOfChat;
        var widthOfDialogs = chatUtility.calculateRightPosition(
          scope.chatLibrary,
          numberOfOpenDialogs
        );
        let right = +widthOfChatContainer + widthOfDialogs + chatLayout.spaceOfDialog;
        element.css('right', right);
      };

      scope.dialogType = chatUtility.dialogType;
      scope.chatLibrary.hasMinimizedDialogs = false;
      scope.layoutIdHasClicked = false;

      scope.openDialog = function(layoutId) {
        $log.debug(' -------------------openDialog------------------ ' + layoutId);
        let lastLayoutId = scope.chatLibrary.dialogIdList.pop();
        scope.chatLibrary.dialogDict[lastLayoutId].isUpdated = true;
        scope.chatLibrary.dialogDict[lastLayoutId].updateStatus = chatUtility.dialogStatus.MINIMIZE;
        scope.chatLibrary.dialogIdList.push(layoutId);
        scope.chatLibrary.dialogDict[layoutId].isUpdated = true;
        scope.chatLibrary.dialogDict[layoutId].updateStatus = chatUtility.dialogStatus.REPLACE;
        let position = scope.chatLibrary.minimizedDialogIdList.indexOf(layoutId);
        if (position > -1) {
          scope.chatLibrary.minimizedDialogIdList.splice(position, 1);
          delete scope.chatLibrary.minimizedDialogData[layoutId];
        }
      };

      scope.remove = function(layoutId) {
        let position = scope.chatLibrary.minimizedDialogIdList.indexOf(layoutId);
        if (position > -1) {
          scope.chatLibrary.minimizedDialogIdList.splice(position, 1);
          delete scope.chatLibrary.minimizedDialogData[layoutId];
          delete scope.chatLibrary.dialogDict[layoutId];
        }
      };

      Roblox.BootstrapWidgets.SetupPopover(
        'top',
        { selector: '#dialogs-minimize' },
        '#dialogs-minimize-container'
      );

      scope.$watch(
        function() {
          return scope.chatLibrary.minimizedDialogIdList;
        },
        function(newValue, oldValue) {
          if (!angular.isUndefined(newValue) && newValue != oldValue) {
            $log.debug('------ watch minimizedDialogIdList ----- ');
            if (newValue.length > 0) {
              if (!scope.chatLibrary.hasMinimizedDialogs) {
                scope.chatLibrary.hasMinimizedDialogs = true;
              }
              updatePosition();
            } else if (newValue.length === 0) {
              scope.chatLibrary.hasMinimizedDialogs = false;
            }
          }
        },
        true
      );

      scope.$watch(
        function() {
          return scope.chatLibrary.chatLayout.areDialogsUpdated;
        },
        function(newValue, oldValue) {
          if (newValue && newValue !== oldValue) {
            scope.$evalAsync(function() {
              scope.chatLibrary.chatLayout.areDialogsUpdated = false;
            });
            updatePosition();
          }
        },
        true
      );
    }
  };
}

chatModule.directive('dialogMinimize', dialogMinimize);

export default dialogMinimize;
