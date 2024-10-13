import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const batchRequestsConstants = {
    defaultCooldown: 1000,

    // The time waited before sending the first request
    // to wait for as many items to be put in the batch as possible.
    defaultProcessBatchWaitTime: 50,

    errors: {
        processFailure: "processFailure",
        unretriableFailure: "unretriableFailure",
        maxAttemptsReached: "maxAttemptsReached"
    }
};

angularJsUtilitiesModule.constant("batchRequestsConstants", batchRequestsConstants);
export default batchRequestsConstants;