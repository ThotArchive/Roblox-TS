import verticalMenuModule from "../verticalMenuModule";
import { BootstrapWidgets } from "Roblox";

function verticalMenu() {
    "ngInject";
     function init() {
         BootstrapWidgets.SetupVerticalMenu();
     }

     return {
         restrict: "A",
         link: function link(scope, element, attrs) {
             var unwatch = scope.$watch(attrs.resetVerticalMenu,
                function () {
                    init();
                });

             scope.$on('$destroy', function () {
                 if (unwatch) {
                     unwatch();
                 }
             });
         }
     }
};

verticalMenuModule.directive("verticalMenu", verticalMenu);

export default verticalMenu;