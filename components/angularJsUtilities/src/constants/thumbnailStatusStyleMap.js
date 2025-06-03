import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const thumbnailStatusStyleMap = {
  Error: "icon-error",
  InReview: "icon-in-review",
  Blocked: "icon-blocked",
  Pending: "icon-pending",
};

angularJsUtilitiesModule.constant("thumbnailStatusStyleMap", thumbnailStatusStyleMap);
export default thumbnailStatusStyleMap;
