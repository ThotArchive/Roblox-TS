import notificationStreamModule from "../notificationStreamModule";

function sortNotificationsByEventDateDesc(notificationStreamUtility) {
    "ngInject";
    return function (notifications) {
        // Sort in descending order.
        return notificationStreamUtility.sortNotificationsByEventDate(notifications, false);
    };
}

notificationStreamModule.filter("sortNotificationsByEventDateDesc", sortNotificationsByEventDateDesc);

export default sortNotificationsByEventDateDesc;