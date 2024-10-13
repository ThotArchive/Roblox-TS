"use strict";
exports.__esModule = true;
exports.bindKeyDownA11yButton = exports.noop = void 0;
// @ts-nocheck
function noop() { }
exports.noop = noop;
var A11yButtonTriggerKeys = ["Enter", " "];
var bindKeyDownA11yButton = function (fnToCall) {
    if (fnToCall === void 0) { fnToCall = noop; }
    return function (event) {
        if (A11yButtonTriggerKeys.includes(event.key)) {
            fnToCall();
        }
    };
};
exports.bindKeyDownA11yButton = bindKeyDownA11yButton;
exports["default"] = {
    bindKeyDownA11yButton: exports.bindKeyDownA11yButton,
    noop: noop
};
//# sourceMappingURL=misc.js.map