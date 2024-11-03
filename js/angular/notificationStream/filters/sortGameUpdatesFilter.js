import notificationStreamModule from "../notificationStreamModule";

function sortGameUpdates(gameUpdatesUtility) {
    "ngInject";
    return function (gameUpdateModels) {
        // Sort in descending order.
        return gameUpdatesUtility.sortGameUpdatesByCreatedDate(gameUpdateModels, false);
    };
}

notificationStreamModule.filter("sortGameUpdates", sortGameUpdates);

export default sortGameUpdates;