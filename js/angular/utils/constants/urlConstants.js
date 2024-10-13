import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const urlConstants = {
        urlQueryStringPrefix: "?",
        urlQueryParameterSeparator: "&",
        hashSign: "#"
};

angularJsUtilitiesModule.constant("urlConstants", urlConstants);
export default urlConstants;