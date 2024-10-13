import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function copyToClipboard() {
    "ngInject";
        function link(scope, element, attrs) {
            element.click(function () {
                var target = attrs["copyTarget"];
                var url = angular.element(target);
                url.select();
                document.execCommand("Copy");
            });
        }

        return {
            restrict: "A",
            link: link
        }
};

angularJsUtilitiesModule.directive("copyToClipboard", copyToClipboard);
export default copyToClipboard;