"use strict";
var _a;
exports.__esModule = true;
exports.SIZE_CONSTS = void 0;
var styles_1 = require("@material-ui/styles");
var BadgeConstants_1 = require("../constants/BadgeConstants");
var lineHeightMultiplier = 1.4;
exports.SIZE_CONSTS = (_a = {},
    _a[BadgeConstants_1.BadgeSizes.TITLE] = {
        marginLeft: "8px",
        fontSize: "28px",
        iconWidth: "28px",
        iconHeight: "28px"
    },
    _a[BadgeConstants_1.BadgeSizes.HEADER] = {
        marginLeft: "4px",
        fontSize: "24px",
        iconWidth: "16px",
        iconHeight: "16px"
    },
    _a[BadgeConstants_1.BadgeSizes.SUBHEADER] = {
        marginLeft: "4px",
        fontSize: "16px",
        iconWidth: "16px",
        iconHeight: "16px"
    },
    _a[BadgeConstants_1.BadgeSizes.CAPTIONHEADER] = {
        marginLeft: "4px",
        fontSize: "14px",
        iconWidth: "16px",
        iconHeight: "16px"
    },
    _a[BadgeConstants_1.BadgeSizes.FOOTER] = {
        marginLeft: "2px",
        fontSize: "12px",
        iconWidth: "12px",
        iconHeight: "12px"
    },
    _a);
var useVerifiedBadgeStyles = function (size) {
    var verifiedBadgeStyles = {
        badge: {
            marginLeft: exports.SIZE_CONSTS[size].marginLeft,
            position: "relative",
            display: "inline-block",
            flexGrow: 1
        },
        iconImg: {
            height: exports.SIZE_CONSTS[size].iconHeight,
            width: exports.SIZE_CONSTS[size].iconWidth,
            marginBottom: "-3x"
        },
        textContainer: {
            maxWidth: "calc(100% - (".concat(exports.SIZE_CONSTS[size].iconWidth, " + ").concat(exports.SIZE_CONSTS[size].marginLeft, "))"),
            width: "min-content",
            fontFamily: '"HCo Gotham SSm", san-serif',
            fontStyle: "normal",
            textDecoration: "none",
            lineHeight: "".concat(lineHeightMultiplier * 100, "%"),
            fontSize: exports.SIZE_CONSTS[size].fontSize,
            display: "inline-block",
            height: "calc(".concat(exports.SIZE_CONSTS[size].fontSize, " * ").concat(lineHeightMultiplier, ")")
        },
        imgWrapper: {
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "auto"
        },
        wrapper: {
            position: "relative",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%"
        },
        applyEllipsisTruncation: {
            width: "100%",
            display: "inline-block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        }
    };
    return (0, styles_1.makeStyles)(verifiedBadgeStyles)();
};
exports["default"] = useVerifiedBadgeStyles;
//# sourceMappingURL=VerifiedBadge.styles.js.map