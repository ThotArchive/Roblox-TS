import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function enterEscapeShift(keyCode) {
  "ngInject";
  return {
    restrict: "A",
    link: function (scope, elem, attrs) {
      elem.bind("keydown keypress", function (e) {
        var code = e.keyCode || e.which;
        if (code === keyCode.enter && !e.shiftKey) {
          e.preventDefault();
          scope.$apply(function () {
            scope.$eval(attrs.enterEscapeShift);
          });
        }
      });
    },
  };
}

angularJsUtilitiesModule.directive("enterEscapeShift", enterEscapeShift);
export default enterEscapeShift;
