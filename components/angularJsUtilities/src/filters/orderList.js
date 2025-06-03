import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function orderList() {
  "ngInject";

  return function (input, sortBy) {
    var ordered = [];
    for (var key in sortBy) {
      ordered.push(input[sortBy[key]]);
    }
    return ordered;
  };
}

angularJsUtilitiesModule.filter("orderList", orderList);
export default orderList;
