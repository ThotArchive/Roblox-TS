import verticalMenuModule from "../verticalMenuModule";

function verticalMenu() {
  "ngInject";

  function init() {
    window.Roblox.BootstrapWidgets.SetupVerticalMenu();
  }

  return {
    restrict: "A",
    link: function link(scope, element, attrs) {
      const unwatch = scope.$watch(attrs.resetVerticalMenu, () => {
        init();
      });

      scope.$on("$destroy", () => {
        if (unwatch) {
          unwatch();
        }
      });
    },
  };
}

verticalMenuModule.directive("verticalMenu", verticalMenu);

export default verticalMenu;
