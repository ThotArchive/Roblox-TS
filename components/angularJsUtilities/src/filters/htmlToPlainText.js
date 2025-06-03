import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

// Please use escapeHtml filter instead if you need to HTML encode some text.
function htmlToPlaintext() {
  "ngInject";

  return function (text) {
    return String(text).replace(/<[^>]+>/gm, "");
  };
}

angularJsUtilitiesModule.filter("htmlToPlaintext", htmlToPlaintext);
export default htmlToPlaintext;
