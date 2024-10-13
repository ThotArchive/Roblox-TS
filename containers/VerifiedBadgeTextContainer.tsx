"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
exports.__esModule = true;
exports.VerifiedBadgeTextContainer = exports.verifiedBadgeTextContainerReactRenderClass = exports.verifiedBadgeIconElDataAttrSelector = exports.verifiedBadgeTextElDataAttrSelector = exports.verifiedBadgeTextWrapperDataAttrSelector = void 0;
var react_1 = __importDefault(require("react"));
var classnames_1 = __importDefault(require("classnames"));
var VerifiedBadge_styles_1 = __importDefault(require("../styles/VerifiedBadge.styles"));
var VerifiedBadgeIcon_1 = require("../components/VerifiedBadgeIcon");
var misc_1 = require("../utils/misc");
// This property is not property supported with the MUI css properties type so we cannot include it in the VerifiedBadgeStyles code.
var defaultFontStyling = {
    fontWeight: 500
};
exports.verifiedBadgeTextWrapperDataAttrSelector = "data-rblx-badge-text-container";
exports.verifiedBadgeTextElDataAttrSelector = "data-rblx-badge-text-el";
exports.verifiedBadgeIconElDataAttrSelector = "data-rblx-badge-icon-el";
exports.verifiedBadgeTextContainerReactRenderClass = "verified-badge-text-container";
var verifiedBadgeTextWrapperDataAttrs = (_a = {},
    _a[exports.verifiedBadgeTextWrapperDataAttrSelector] = "",
    _a);
var verifiedBadgeTextElDataAttrs = (_b = {},
    _b[exports.verifiedBadgeTextElDataAttrSelector] = "",
    _b);
var verifiedBadgeIconElDataAttrs = (_c = {},
    _c[exports.verifiedBadgeIconElDataAttrSelector] = "",
    _c);
var VerifiedBadgeTextContainer = function (_a) {
    var size = _a.size, titleText = _a.titleText, _b = _a.showVerifiedBadge, showVerifiedBadge = _b === void 0 ? false : _b, text = _a.text, _c = _a.textEl, textEl = _c === void 0 ? null : _c, _d = _a.badgeEl, badgeEl = _d === void 0 ? null : _d, _e = _a.overrideTextContainerClass, overrideTextContainerClass = _e === void 0 ? "" : _e, _f = _a.overrideWrapperClass, overrideWrapperClass = _f === void 0 ? "" : _f, _g = _a.additionalTextContainerClass, additionalTextContainerClass = _g === void 0 ? "" : _g, _h = _a.additionalWrapperClass, additionalWrapperClass = _h === void 0 ? "" : _h, _j = _a.onIconClick, onIconClick = _j === void 0 ? misc_1.noop : _j;
    if (!size) {
        throw new Error("Must provide a size prop");
    }
    if (!titleText) {
        throw new Error("Must provide a titleText for accessibility");
    }
    var _k = (0, VerifiedBadge_styles_1["default"])(size), _l = _k.wrapper, wrapper = _l === void 0 ? "" : _l, _m = _k.textContainer, textContainer = _m === void 0 ? "" : _m, _o = _k.badge, badge = _o === void 0 ? "" : _o, _p = _k.applyEllipsisTruncation, applyEllipsisTruncation = _p === void 0 ? "" : _p;
    var onKeyDownHandler = (0, misc_1.bindKeyDownA11yButton)(onIconClick);
    var textContainerClasses = overrideTextContainerClass ||
        (0, classnames_1["default"])(textContainer, additionalTextContainerClass);
    var wrapperClasses = overrideWrapperClass || (0, classnames_1["default"])(wrapper, additionalWrapperClass);
    var textToRender = textEl || (react_1["default"].createElement("span", { className: applyEllipsisTruncation }, text));
    var verifiedBadgeEl = showVerifiedBadge ? (react_1["default"].createElement(VerifiedBadgeIcon_1.VerifiedBadgeIcon, { size: size, titleText: titleText })) : null;
    var finalBadgeElToRender = badgeEl || verifiedBadgeEl;
    var stylesToAddToTextContainer = overrideTextContainerClass
        ? {}
        : defaultFontStyling;
    return (react_1["default"].createElement("span", __assign({}, verifiedBadgeTextWrapperDataAttrs, { className: wrapperClasses }),
        react_1["default"].createElement("span", __assign({}, verifiedBadgeTextElDataAttrs, { style: stylesToAddToTextContainer, className: textContainerClasses }), textToRender),
        react_1["default"].createElement("span", __assign({}, verifiedBadgeIconElDataAttrs, { role: "button", tabIndex: 0, onClick: onIconClick, onKeyDown: onKeyDownHandler, className: badge }), finalBadgeElToRender)));
};
exports.VerifiedBadgeTextContainer = VerifiedBadgeTextContainer;
exports["default"] = exports.VerifiedBadgeTextContainer;
//# sourceMappingURL=VerifiedBadgeTextContainer.js.map