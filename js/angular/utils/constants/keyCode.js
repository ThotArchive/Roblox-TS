import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const keyCode = {
    tab: 9,
    enter: 13,
    esc: 27,
    arrowUp: 38,
    arrowDown: 40
};

angularJsUtilitiesModule.constant("keyCode", keyCode);
export default keyCode;