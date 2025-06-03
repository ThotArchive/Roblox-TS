import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function seoUrl() {
  "ngInject";
  return function (rootTemplate, id, name) {
    if (typeof name != "string") {
      name = "";
    }

    // https://stackoverflow.com/questions/987105/asp-net-mvc-routing-vs-reserved-filenames-in-windows
    var seoName =
      name
        .replace(/'/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, "") || "unnamed";
    var relativeUrl = "/" + rootTemplate + "/" + id + "/" + seoName;
    const { Endpoints } = window.Roblox;
    if (!Endpoints) {
      return relativeUrl;
    }
    return Endpoints.getAbsoluteUrl(relativeUrl);
  };
}

angularJsUtilitiesModule.filter("seoUrl", seoUrl);
export default seoUrl;
