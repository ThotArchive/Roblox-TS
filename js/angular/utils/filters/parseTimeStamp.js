import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function parseTimeStamp() {
    "ngInject";

    return function (dateTime) {
        if (dateTime) {
            return (typeof dateTime === "string" && dateTime.search("Date") > -1) ? parseInt(dateTime.slice(6, -2)) : new Date(dateTime);
        }
        return null;
    }
};

angularJsUtilitiesModule.filter("parseTimeStamp", parseTimeStamp);
export default parseTimeStamp;