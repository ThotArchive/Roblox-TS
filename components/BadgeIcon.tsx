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
exports.__esModule = true;
exports.BadgeIcon = void 0;
var react_1 = __importDefault(require("react"));
var classnames_1 = __importDefault(require("classnames"));
var VerifiedBadge_styles_1 = __importDefault(require("../styles/VerifiedBadge.styles"));
var misc_1 = require("../utils/misc");
var BadgeIcon = function (_a) {
    var size = _a.size, src = _a.src, titleText = _a.titleText, additionalContainerClass = _a.additionalContainerClass, overrideContainerClass = _a.overrideContainerClass, additionalImgClass = _a.additionalImgClass, overrideImgClass = _a.overrideImgClass, _b = _a.dataAttrs, dataAttrs = _b === void 0 ? {} : _b, _c = _a.onIconClick, onIconClick = _c === void 0 ? misc_1.noop : _c;
    if (!size) {
        throw new Error("Must provide a size prop");
    }
    if (!titleText) {
        throw new Error("Must provide a titleText for accessibility");
    }
    if (!src) {
        throw new Error("Must provide a src prop");
    }
    var _d = (0, VerifiedBadge_styles_1["default"])(size), _e = _d.iconImg, iconImg = _e === void 0 ? "" : _e, _f = _d.imgWrapper, imgWrapper = _f === void 0 ? "" : _f;
    var wrapperClass = overrideContainerClass || (0, classnames_1["default"])(additionalContainerClass, imgWrapper);
    var imgClass = overrideImgClass || [additionalImgClass, iconImg].join(" ") || "";
    var onKeyDownHandler = (0, misc_1.bindKeyDownA11yButton)(onIconClick);
    return (react_1["default"].createElement("span", __assign({ role: "button", tabIndex: 0 }, dataAttrs, { "data-rblx-badge-icon": true, className: wrapperClass, onClick: onIconClick, onKeyDown: onKeyDownHandler }),
        react_1["default"].createElement("img", { className: imgClass, src: src, title: titleText, alt: titleText })));
};
exports.BadgeIcon = BadgeIcon;
exports["default"] = exports.BadgeIcon;
//# sourceMappingURL=BadgeIcon.js.map