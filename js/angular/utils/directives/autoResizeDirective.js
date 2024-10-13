import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function autoResize($window) {
    "ngInject";
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            // Default settings
            scope.attrs = {
                rows: 1,
                maxLines: 999
            };

            // Merge defaults with user preferences
            for (var key in scope.attrs) {
                if (attrs[key]) {
                    scope.attrs[key] = parseInt(attrs[key]);
                }
            }

            // Calculates the vertical padding of the element
            scope.getOffset = function () {
                var style = $window.getComputedStyle(element[0], null),
                    props = ['paddingTop', 'paddingBottom'],
                    offset = 0;

                for (var i = 0; i < props.length; i++) {
                    offset += parseInt(style[props[i]]);
                }
                return offset;
            };

            // Sets textarea height as exact height of content
            scope.autoResize = function () {
                var newHeight = 0, hasGrown = false, rows;
                if ((element[0].scrollHeight - scope.offset) > scope.maxAllowedHeight) {
                    element[0].style.overflowY = 'scroll';
                    newHeight = scope.maxAllowedHeight;
                }
                else {
                    element[0].style.overflowY = 'hidden';
                    element[0].style.height = 'auto';
                    newHeight = element[0].scrollHeight;
                    hasGrown = true;
                }
                element[0].style.height = newHeight + 'px';
                return hasGrown;
            };

            scope.offset = scope.getOffset();
            scope.lineHeight = parseInt(element.css('line-height').replace("px", ""));
            scope.maxAllowedHeight = (scope.lineHeight * scope.attrs.maxLines) - scope.offset;

            scope.$watch(attrs.ngModel, function() {
                scope.autoResize();
            }, true);
        }
    }
};

angularJsUtilitiesModule.directive("autoResize", autoResize);
export default autoResize;