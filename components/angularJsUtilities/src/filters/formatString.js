import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

/// Usage: $filter('formatString')(stringRequiredFormat, {params})
function formatString() {
  "ngInject";

  //return the percentage width of upvote element;
  return function (input) {
    if (arguments && arguments.length > 1) {
      var str = arguments[0];
      var params = arguments[1];
      for (var prop in params) {
        var value = params[prop];
        var regex = new RegExp("{" + prop + "(:.*?)?\\??}");
        str = str.replace(regex, value);
      }
      return str;
    }
    return input;
  };
}

angularJsUtilitiesModule.filter("formatString", formatString);
export default formatString;
