import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const abTestConstants = {
    subjectType: {
        user: "User",
        browserTracker: "BrowserTracker"
    },
    urls: {
        checkEnrollment: "/v1/get-enrollments",
        enroll: "/v1/enrollments"
    },
    response: {
        status: {
            enrolled: "Enrolled",
            inactive: "Inactive",
            noExperiment: "NoExperiment"
        }
    },
    errorCode: {
        noResultForExperiment: 0
    }
};

angularJsUtilitiesModule.constant("abTestConstants", abTestConstants);
export default abTestConstants;