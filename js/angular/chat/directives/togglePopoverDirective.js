import angular from 'angular';
import chatModule from '../chatModule';

function togglePopover($log, $document) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link(scope, element, attrs) {
      const { togglePopoverParams } = scope.dialogLayout;
      const { dialogSelector } = togglePopoverParams;
      const { triggerSelector } = togglePopoverParams;
      const { pinIconClassName } = togglePopoverParams;
      const { dialogTriggerClassSelector } = togglePopoverParams;
      const isExclusiveClickSelector = togglePopoverParams.isExclusiveClickSelector
        ? togglePopoverParams.isExclusiveClickSelector
        : 'is-exclusive-click';

      element.on('click', function(event) {
        const target = angular.element(event.target);
        if (insideTrigger(target)) {
          scope.dialogLayout.togglePopoverParams.isOpen = !scope.dialogLayout.togglePopoverParams
            .isOpen;
        }
      });

      function bindDocumentClick() {
        $document.on('click', function(event) {
          event.stopPropagation();

          const target = angular.element(event.target);

          if (!insideTrigger(target) && !insideDialog(target) && !isExclusive(target)) {
            scope.dialogLayout.togglePopoverParams.isOpen = false;
          }
        });
      }
      function insideTrigger(target) {
        const trigger = angular.element(triggerSelector);
        return trigger.is(target) || (trigger.find(target) && trigger.find(target).length > 0);
      }

      function insideDialog(target) {
        const dialog = angular.element(dialogSelector);
        return dialog.find(target) && dialog.find(target).length > 0;
      }

      function isExclusive(target) {
        let isExclusive = false;
        if (isPinIcon(target)) {
          isExclusive =
            (scope.dialogData.playTogetherIds && scope.dialogData.playTogetherIds.length > 0) ||
            scope.dialogData.pinGame;
        }
        if (isDialogTrigger(target)) {
          isExclusive = true;
        }

        if (target.hasClass(isExclusiveClickSelector)) {
          isExclusive = true;
        }

        return isExclusive;
      }

      function isPinIcon(target) {
        return target.hasClass(pinIconClassName);
      }

      function isDialogTrigger(target) {
        const dialogTrigger = angular.element(dialogTriggerClassSelector);
        return (
          dialogTrigger.is(target) ||
          (dialogTrigger.find(target) && dialogTrigger.find(target).length > 0)
        );
      }

      const watchPlayTogetherIds = scope.$watch(
        function() {
          return scope.dialogData.playTogetherIds;
        },
        function(newValue, oldValue) {
          if (newValue !== oldValue && newValue && newValue.length > 0) {
            if (!scope.dialogLayout.togglePopoverParams.isOpen) {
              scope.dialogLayout.togglePopoverParams.isOpen = true;
            }
          }
        },
        true
      );

      const watchDialogFirstTimeOpen = scope.$watch(
        function() {
          return scope.dialogLayout.togglePopoverParams.isFirstTimeOpen;
        },
        function(newValue, oldValue) {
          if (newValue) {
            bindDocumentClick();
          }
        },
        true
      );

      scope.$on('$destroy', function() {
        watchPlayTogetherIds();
        watchDialogFirstTimeOpen();
      });
    }
  };
}

chatModule.directive('togglePopover', togglePopover);

export default togglePopover;
