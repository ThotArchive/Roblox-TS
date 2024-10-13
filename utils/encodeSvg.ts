"use strict";
exports.__esModule = true;
exports.svgToEncodedDataImageString = exports.getDataImageString = exports.encodeSVG = exports.QuoteTypes = exports.blankSvg = void 0;
// @ts-nocheck
var symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
exports.blankSvg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 500 500" width="500" height="500" id="starter_svg"></svg>';
var QuoteTypes;
(function (QuoteTypes) {
    QuoteTypes["SINGLE"] = "single";
    QuoteTypes["DOUBLE"] = "double";
})(QuoteTypes = exports.QuoteTypes || (exports.QuoteTypes = {}));
var encodeSVG = function (data, externalQuotesValue) {
    var encodedData = data;
    // Use single quotes instead of double to avoid encoding.
    if (externalQuotesValue === QuoteTypes.DOUBLE) {
        encodedData = encodedData.replace(/"/g, "'");
    }
    else {
        encodedData = encodedData.replace(/'/g, '"');
    }
    encodedData = encodedData.replace(/>\s{1,}</g, "><");
    encodedData = encodedData.replace(/\s{2,}/g, " ");
    return encodedData.replace(symbols, encodeURIComponent);
};
exports.encodeSVG = encodeSVG;
var getDataImageString = function (escapedEncodedSvg) {
    return "data:image/svg+xml;charset=utf-8,".concat(escapedEncodedSvg);
};
exports.getDataImageString = getDataImageString;
var svgToEncodedDataImageString = function (svgMarkup) {
    return (0, exports.getDataImageString)((0, exports.encodeSVG)(svgMarkup, QuoteTypes.DOUBLE));
};
exports.svgToEncodedDataImageString = svgToEncodedDataImageString;
//# sourceMappingURL=encodeSvg.js.map