import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const thumbnailStyleConstants = {
  sm: "sm",
  md: "md",
  lg: "lg",
  group: {
    sm: "thumbnail-status-placeholder-sm",
    md: "thumbnail-status-placeholder-md",
    lg: "thumbnail-status-placeholder-lg",
  },
};

angularJsUtilitiesModule.constant("thumbnailStyleConstants", thumbnailStyleConstants);
export default thumbnailStyleConstants;
