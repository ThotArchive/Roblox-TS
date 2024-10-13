import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function switcher($log) {
    "ngInject";

    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.switcher = {}
            $scope.switcher.games = { currPage: 0, itemsCount: 0 };
            $scope.switcher.groups = { currPage: 0, itemsCount: 0 };
        }],
        scope: {
            currpage: '=',
            itemscount: '='
        },
        link: function (scope, element, attrs) {
            var selectedElement = null;
            scope.currpage = 0;
            if (element.find(".switcher-item") && element.find(".switcher-item").length > 0) {
                scope.itemscount = element.find(".switcher-item").length;
            }

            element.find('.carousel-control').on("click", function ($event) {

                scope.$apply(function () {
                    if (angular.element($event.currentTarget).attr("data-switch") == 'next') {
                        if (scope.currpage + 1 <= scope.itemscount - 1) {
                            scope.currpage += 1;
                        } else {
                            scope.currpage = 0;
                        }
                    } else {

                        if (scope.currpage - 1 >= 0) {
                            scope.currpage -= 1;
                        } else {
                            scope.currpage = scope.itemscount - 1;
                        }
                    }
                });
                selectedElement = element.find(".switcher-item[data-index=" + scope.currpage + "] img");
                if (!selectedElement.attr('src')) {
                    selectedElement.attr('src', selectedElement.attr('data-src'));
                }
            });
        }
    }
};

angularJsUtilitiesModule.directive("switcher", switcher);
export default switcher;