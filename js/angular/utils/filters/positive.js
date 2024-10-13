import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function positive() {
    "ngInject";
    return function (input) {
        if (!input) {
            return 0;
        }

        return Math.abs(input);
    };
};

angularJsUtilitiesModule.filter("positive", positive);
export default positive;