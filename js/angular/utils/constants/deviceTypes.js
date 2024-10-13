import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const deviceTypes = {
    COMPUTER: "Computer",
    PHONE: "Phone",
    TABLET: "Tablet"
};

angularJsUtilitiesModule.constant("deviceTypes", deviceTypes);
export default deviceTypes;