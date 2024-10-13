"use strict";
exports.__esModule = true;
exports.VERIFIED_BADGE_SVG_URL_ENCODED_DATA_IMAGE = exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_LIGHT = exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_DARK = exports.PREMIUM_ICON_SVG_DATA_OUTLINE_LIGHT_SVG = exports.PREMIUM_ICON_SVG_DATA_OUTLINE_DARK_SVG = exports.VERIFIED_BADGE_RAW_SVG = void 0;
var encodeSvg_1 = require("../utils/encodeSvg");
exports.VERIFIED_BADGE_RAW_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\"> <g clip-path=\"url(#clip0_8_46)\"> <rect x=\"5.88818\" width=\"22.89\" height=\"22.89\" transform=\"rotate(15 5.88818 0)\" fill=\"#0066FF\"/> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M20.543 8.7508L20.549 8.7568C21.15 9.3578 21.15 10.3318 20.549 10.9328L11.817 19.6648L7.45 15.2968C6.85 14.6958 6.85 13.7218 7.45 13.1218L7.457 13.1148C8.058 12.5138 9.031 12.5138 9.633 13.1148L11.817 15.2998L18.367 8.7508C18.968 8.1498 19.942 8.1498 20.543 8.7508Z\" fill=\"white\"/> </g> <defs> <clipPath id=\"clip0_8_46\"> <rect width=\"28\" height=\"28\" fill=\"white\"/> </clipPath> </defs> </svg>";
exports.PREMIUM_ICON_SVG_DATA_OUTLINE_DARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path d="M28 24a4 4 0 01-4 4H14v-4h10V4H4v24a4 4 0 01-4-4V4a4 4 0 014-4h20a4 4 0 014 4zm-7-7v4h-7v-4h3v-6h-6v17H7V7h14v10z" fill="#393b3d" fill-rule="evenodd"/></svg>';
exports.PREMIUM_ICON_SVG_DATA_OUTLINE_LIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><defs><clipPath id="a"><path d="M28 24a4 4 0 01-4 4H14v-4h10V4H4v24a4 4 0 01-4-4V4a4 4 0 014-4h20a4 4 0 014 4zm-7-7v4h-7v-4h3v-6h-6v17H7V7h14v10z" fill="none" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#a)"><path fill="#fff" d="M-5-5h38v38H-5z"/></g></svg>';
exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_DARK = (0, encodeSvg_1.svgToEncodedDataImageString)(exports.PREMIUM_ICON_SVG_DATA_OUTLINE_DARK_SVG);
exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_LIGHT = (0, encodeSvg_1.svgToEncodedDataImageString)(exports.PREMIUM_ICON_SVG_DATA_OUTLINE_LIGHT_SVG);
exports.VERIFIED_BADGE_SVG_URL_ENCODED_DATA_IMAGE = (0, encodeSvg_1.svgToEncodedDataImageString)(exports.VERIFIED_BADGE_RAW_SVG);
exports["default"] = {
    PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_DARK: exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_DARK,
    PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_LIGHT: exports.PREMIUM_ICON_SVG_URL_ENCODED_DATA_OUTLINE_LIGHT,
    VERIFIED_BADGE_SVG_URL_ENCODED_DATA_IMAGE: exports.VERIFIED_BADGE_SVG_URL_ENCODED_DATA_IMAGE
};
//# sourceMappingURL=sharedVariables.js.map