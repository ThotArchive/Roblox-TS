import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const presenceTypes = {
        offline: {
            status: 0,
            className: ""
        },
        online: {
            status: 1,
            className: "icon-online"
        },
        ingame: {
            status: 2, 
            className: "icon-game"
        },
        instudio: {
            status: 3,
            className: "icon-studio"
        }
};

angularJsUtilitiesModule.constant("presenceTypes", presenceTypes);
export default presenceTypes;