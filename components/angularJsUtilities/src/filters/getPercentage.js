import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

function getPercentage() {
  "ngInject";
  //return the percentage width of upvote element;
  return function (upvotes, downvotes) {
    var percentUp = 0;
    if (!isNaN(upvotes) && !isNaN(downvotes)) {
      if (upvotes === 0) {
        percentUp = 0;
      } else if (downvotes === 0) {
        percentUp = 100;
      } else {
        percentUp = Math.floor((upvotes / (upvotes + downvotes)) * 100);
      }

      if (percentUp > 100) {
        percentUp = 100;
      }
    }
    return percentUp + "%";
  };
}

angularJsUtilitiesModule.filter("getPercentage", getPercentage);
export default getPercentage;
