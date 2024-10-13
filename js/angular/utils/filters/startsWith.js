import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function startsWith() {
    "ngInject";

    return function (array, search, attr) {
        var matches = [];
        if (array) {
            for (var i = 0; i < array.length; i++) {
                var elem = !attr ? array[i].toLowerCase() : array[i][attr].toLowerCase();
                if (elem.indexOf(search.toLowerCase()) === 0 &&
                    search.length < elem.length) {
                    matches.push(array[i]);
                }
            }
        }
        if (matches.length === 0) {
            matches = array;
        }
        return matches;
    };
};

angularJsUtilitiesModule.filter("startsWith", startsWith);
export default startsWith;