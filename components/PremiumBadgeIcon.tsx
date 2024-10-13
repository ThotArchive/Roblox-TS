"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
exports.PremiumBadgeIcon = exports.premiumBadgeIconReactRenderClass = exports.premiumBadgeIconDataAttrSelector = exports.PremiumBadgeThemeOptions = void 0;
var react_1 = __importDefault(require("react"));
var misc_1 = require("../utils/misc");
var BadgeIcon_1 = require("./BadgeIcon");
var sharedVariables_1 = require("../styles/sharedVariables");
var PremiumBadgeThemeOptions;
(function (PremiumBadgeThemeOptions) {
    PremiumBadgeThemeOptions["LIGHT_OUTLINE"] = "lightOutline";
    PremiumBadgeThemeOptions["DARK_OUTLINE"] = "darkOutline";
})(PremiumBadgeThemeOptions = exports.PremiumBadgeThemeOptions || (exports.PremiumBadgeThemeOptions = {}));
exports.premiumBadgeIconDataAttrSelector = "data-rblx-premium-badge-icon";
exports.premiumBadgeIconReactRenderClass = "premium-badge-icon";
var premiumBadgeDataAttrs = (_a = {},
    _a[exports.premiumBadgeIconDataAttrSelector] = "",
    _a);
var PremiumBadgeIcon = function (_a) {
    var iconTheme = _a.iconTheme, size = _a.size, titleText = _a.titleText, additionalContainerClass = _a.additionalContainerClass, overrideContainerClass = _a.overrideContainerClass, additionalImgClass = _a.additionalImgClass, overrideImgClass = _a.overrideImgClass, _b = _a.onIconClick, onIconClick = _b === void 0 ? misc_1.noop : _b;
    if (!size) {
        throw new Error("Must provide a size prop");
    }
    if (!titleText) {
        throw new Error("Must provide a titleText for accessibility");
    }
    var srcToDisplay = iconTheme === PremiumBadgeThemeOptions.LIGHT_OUTLINE
        ? sharedVariables_1.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_LIGHT
        : sharedVariables_1.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_DARK;
    return (react_1["default"].createElement(BadgeIcon_1.BadgeIcon, { dataAttrs: premiumBadgeDataAttrs, size: size, titleText: titleText, additionalContainerClass: additionalContainerClass, overrideContainerClass: overrideContainerClass, additionalImgClass: additionalImgClass, overrideImgClass: overrideImgClass, src: srcToDisplay, onIconClick: onIconClick }));
};
exports.PremiumBadgeIcon = PremiumBadgeIcon;
exports["default"] = exports.PremiumBadgeIcon;
//# sourceMappingURL=PremiumBadgeIcon.js.map