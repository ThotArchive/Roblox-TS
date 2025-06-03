import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function stickToTop($window) {
  "ngInject";
  return {
    restrict: "A",
    scope: {
      isElementAtTop: "=",
    },
    link: function (scope, element) {
      var initialBox = element[0].getBoundingClientRect();
      var initialYPosition = initialBox.top;

      angular.element($window).bind("scroll", function () {
        var scrollPosition = $window.pageYOffset;

        if (!scope.isElementAtTop && scrollPosition >= initialYPosition) {
          scope.isElementAtTop = true;
          scope.$apply();
        } else if (scope.isElementAtTop && scrollPosition <= initialYPosition) {
          scope.isElementAtTop = false;
          scope.$apply();
        }
      });
    },
  };
}

angularJsUtilitiesModule.directive("stickToTop", stickToTop);
export default stickToTop;
