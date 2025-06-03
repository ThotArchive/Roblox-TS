import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const thumbnailResponseStatuses = {
  completed: "Completed",
  inReview: "InReview",
  pending: "Pending",
  blocked: "Blocked",
  error: "Error",
};

angularJsUtilitiesModule.constant("thumbnailResponseStatuses", thumbnailResponseStatuses);
export default thumbnailResponseStatuses;
