import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

// https://stackoverflow.com/a/15732476/1663648
function contextMenu($parse) {
  "ngInject";
  return function (scope, element, attrs) {
    var fn = $parse(attrs.contextMenu);
    element.bind("contextmenu", function (event) {
      scope.$apply(function () {
        fn(scope, { $event: event });
      });
    });
  };
}

angularJsUtilitiesModule.directive("contextMenu", contextMenu);
export default contextMenu;
