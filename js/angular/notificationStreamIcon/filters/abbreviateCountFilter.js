import notificationStreamIconModule from "../notificationStreamIconModule";

function abbreivateCount() {
    "ngInject";
    var threshold = 100;
    var abbreviatedCounts = {
        100: "99+",
        1000: "1K+"
    }
    //return the percentage width of upvote element;
    return function (count, limit, abbreviated) {
        if (!limit) {
            limit = threshold;
        }
        if (!abbreviated) {
            abbreviated = abbreviatedCounts[limit];
        }
        if (count >= limit) {
            return abbreviated;
        }
        return count;
    }
}
notificationStreamIconModule.filter("abbreivateCount", abbreivateCount);

export default abbreivateCount;