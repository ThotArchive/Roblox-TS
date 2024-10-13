"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
exports.VerifiedBadgeIcon = exports.verifiedBadgeIconReactRenderClass = exports.verifiedBadgeIconDataAttrSelector = void 0;
var react_1 = __importDefault(require("react"));
var misc_1 = require("../utils/misc");
var BadgeIcon_1 = require("./BadgeIcon");
var sharedVariables_1 = require("../styles/sharedVariables");
exports.verifiedBadgeIconDataAttrSelector = "data-rblx-verified-badge-icon";
exports.verifiedBadgeIconReactRenderClass = "verified-badge-icon";
var verifiedBadgeDataAttrs = (_a = {},
    _a[exports.verifiedBadgeIconDataAttrSelector] = "",
    _a);
var VerifiedBadgeIcon = function (_a) {
    var size = _a.size, titleText = _a.titleText, additionalContainerClass = _a.additionalContainerClass, overrideContainerClass = _a.overrideContainerClass, additionalImgClass = _a.additionalImgClass, overrideImgClass = _a.overrideImgClass, _b = _a.onIconClick, onIconClick = _b === void 0 ? misc_1.noop : _b;
    if (!size) {
        throw new Error("Must provide a size prop");
    }
    if (!titleText) {
        throw new Error("Must provide a titleText for accessibility");
    }
    return (react_1["default"].createElement(BadgeIcon_1.BadgeIcon, { dataAttrs: verifiedBadgeDataAttrs, size: size, titleText: titleText, additionalContainerClass: additionalContainerClass, overrideContainerClass: overrideContainerClass, additionalImgClass: additionalImgClass, overrideImgClass: overrideImgClass, src: sharedVariables_1.VERIFIED_BADGE_SVG_URL_ENCODED_DATA_IMAGE, onIconClick: onIconClick }));
};
exports.VerifiedBadgeIcon = VerifiedBadgeIcon;
exports["default"] = exports.VerifiedBadgeIcon;
//# sourceMappingURL=VerifiedBadgeIcon.js.map