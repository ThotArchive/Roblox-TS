import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function capitalize() {
  "ngInject";

  return function (input) {
    if (input != null) {
      var inputArr = input.split(" "),
        output = [];
      for (var i = 0; i < inputArr.length; i++) {
        var item = inputArr[i].toLowerCase();
        output.push(item.substring(0, 1).toUpperCase() + item.substring(1));
      }
      return output.join(" ");
    }
  };
}

angularJsUtilitiesModule.filter("capitalize", capitalize);
export default capitalize;
