import angularJsUtilitiesModule from "../angularJsUtilitiesModule";

const performanceMarkLabels = {
    chat: {
        chatPageDataLoaded: "chat_pageData_loaded",
        chatConversationsLoading: "chat_conversations_loading",
        chatConversationsLoaded: "chat_conversations_loaded",
        chatSignalRInitializing: "chat_signalR_initializing",
        chatSignalRSucceeded: "chat_signalR_succeeded"
    }
};

angularJsUtilitiesModule.constant("performanceMarkLabels", performanceMarkLabels);
export default performanceMarkLabels;