import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const callBackTypes = {
        SUCCESS: "Success",
        MODERATED: "Moderated"
};

angularJsUtilitiesModule.constant("callBackTypes", callBackTypes);
export default callBackTypes;