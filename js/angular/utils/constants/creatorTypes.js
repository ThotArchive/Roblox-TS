import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const creatorTypeConstants = {
    creatorTypes: {
        user: 'User',
        group: 'Group'
    }
};

angularJsUtilitiesModule.constant("creatorTypeConstants", creatorTypeConstants);
export default creatorTypeConstants;