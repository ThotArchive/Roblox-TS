import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function firstLetter() {
    "ngInject";
    return function (string) {
        return string != null ? string.substring(0, 1).toLowerCase() : "";
    };
};

angularJsUtilitiesModule.filter("firstLetter", firstLetter);
export default firstLetter;