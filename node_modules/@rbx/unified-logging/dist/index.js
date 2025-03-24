import { useState, useRef, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import 'intersection-observer';

// Polyfill for intersection-observer for older browsers
function observeVisibility(options, callback) {
    const { element, threshold } = options;
    try {
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            callback(entry?.isIntersecting || false);
        }, { threshold });
        intersectionObserver.observe(element);
        return () => intersectionObserver.disconnect();
    }
    catch (_) {
        // Ignore cases where IntersectionObserver does not exist in older browsers, since we have added the polyfill
    }
    return () => undefined;
}
function observeChildrenVisibility(options, callback) {
    const { elements, threshold } = options;
    try {
        const intersectionObserver = new window.IntersectionObserver(callback, { threshold });
        elements.forEach(el => {
            intersectionObserver.observe(el);
        });
        return () => intersectionObserver.disconnect();
    }
    catch (_) {
        // Ignore cases where IntersectionObserver does not exist in older browsers, since we have added the polyfill
    }
    return () => undefined;
}
var elementVisibilityService = {
    observeVisibility,
    observeChildrenVisibility
};

const splitArray = (inputArray, chunkSize) => {
    if (inputArray.length === 0 || chunkSize === 0) {
        return [inputArray];
    }
    const result = [];
    for (let i = 0; i < inputArray.length; i += chunkSize) {
        result.push(inputArray.slice(i, i + chunkSize));
    }
    return result;
};

const impressionConstants = {
    // Include up to 25 items in each impressions event
    maxItemsInImpressionsEvent: 25,
    // When 50% or more of a tile is visible, send an impression event
    impressionsItemIntersectionThreshold: 0.5
};

const { maxItemsInImpressionsEvent, impressionsItemIntersectionThreshold } = impressionConstants;
/**
 * Tracks the visibility of the children elements within the containerRef, and
 * calls onImpressionsDetected with the indexes of the children that have been impressed.
 *
 * Note: containerRef must be the direct parent of the children elements to track.
 */
const useCollectionItemsIntersectionTracker = (containerRef, childrenLength, onImpressionsDetected) => {
    const [reportedImpressions, setReportedImpressions] = useState(new Set());
    const [impressedRange, setImpressedRange] = useState(new Set());
    const disconnectRef = useRef(null);
    const sendImpressions = useCallback(() => {
        const impressedRangeArray = Array.from(impressedRange);
        const subArrays = splitArray(impressedRangeArray.filter(index => !reportedImpressions.has(index)), maxItemsInImpressionsEvent).filter((indexes) => indexes.length > 0);
        subArrays.forEach((indexesToSend) => {
            onImpressionsDetected(indexesToSend);
            setReportedImpressions((prevReportedImpressions) => {
                const newReportedImpressions = prevReportedImpressions;
                indexesToSend.forEach(index => newReportedImpressions.add(index));
                return newReportedImpressions;
            });
        });
    }, [reportedImpressions, impressedRange, onImpressionsDetected]);
    const sendImpressionsDebounced = debounce(() => sendImpressions());
    useEffect(() => {
        const tileElements = Array.from(containerRef?.current?.children ?? []).filter((element) => element instanceof HTMLElement);
        const getSortedImpressedIndexes = (entries, observer) => {
            const impressedIndexes = [];
            entries.forEach(entry => {
                if (entry?.isIntersecting) {
                    const tileIndex = tileElements.findIndex(tileElement => tileElement === entry.target);
                    if (tileIndex >= 0) {
                        impressedIndexes.push(tileIndex);
                        observer.unobserve(entry.target);
                    }
                }
            });
            return impressedIndexes.sort((a, b) => a - b);
        };
        const onObserve = (entries, observer) => {
            sendImpressionsDebounced.cancel();
            const sortedImpressedIndexes = getSortedImpressedIndexes(entries, observer);
            setImpressedRange((prevImpressedRange) => {
                const newImpressedRange = prevImpressedRange;
                sortedImpressedIndexes.forEach(index => newImpressedRange.add(index));
                return newImpressedRange;
            });
            sendImpressionsDebounced();
        };
        disconnectRef.current = observeChildrenVisibility({
            elements: tileElements,
            threshold: impressionsItemIntersectionThreshold
        }, onObserve);
        return () => {
            if (disconnectRef?.current) {
                disconnectRef.current();
            }
        };
    }, [containerRef, childrenLength, impressedRange, sendImpressionsDebounced]);
};

var EventNames;
(function (EventNames) {
    EventNames["ItemImpressions"] = "itemImpressions";
    EventNames["ItemAction"] = "itemAction";
})(EventNames || (EventNames = {}));
var EventContext;
(function (EventContext) {
    EventContext["Home"] = "home";
    EventContext["UserProfile"] = "userProfile";
})(EventContext || (EventContext = {}));
var SessionInfo;
(function (SessionInfo) {
    SessionInfo["HomePageSessionInfo"] = "homePageSessionInfo";
    SessionInfo["DiscoverPageSessionInfo"] = "discoverPageSessionInfo";
    SessionInfo["GameSearchSessionInfo"] = "gameSearchSessionInfo";
})(SessionInfo || (SessionInfo = {}));
var SharedEventMetadata;
(function (SharedEventMetadata) {
    SharedEventMetadata["ContentType"] = "contentType";
    SharedEventMetadata["Context"] = "context";
    SharedEventMetadata["CollectionId"] = "collectionId";
    SharedEventMetadata["CollectionPosition"] = "collectionPosition";
})(SharedEventMetadata || (SharedEventMetadata = {}));
var ContentType;
(function (ContentType) {
    ContentType["User"] = "User";
})(ContentType || (ContentType = {}));
var UserPresence;
(function (UserPresence) {
    UserPresence["Online"] = "online";
    UserPresence["InGame"] = "inGame";
    UserPresence["InStudio"] = "inStudio";
    UserPresence["Offline"] = "offline";
})(UserPresence || (UserPresence = {}));
var FriendStatus;
(function (FriendStatus) {
    FriendStatus["Friend"] = "friend";
    FriendStatus["NotFriend"] = "notFriend";
})(FriendStatus || (FriendStatus = {}));

var ItemImpressionsMetadata;
(function (ItemImpressionsMetadata) {
    ItemImpressionsMetadata["ItemIds"] = "itemIds";
    ItemImpressionsMetadata["ItemPositions"] = "itemPositions";
    ItemImpressionsMetadata["RowNumbers"] = "rowNumbers";
    ItemImpressionsMetadata["FeedRowNumbers"] = "feedRowNumbers";
    ItemImpressionsMetadata["PositionsInRow"] = "positionsInRow";
    ItemImpressionsMetadata["PositionsInTopic"] = "positionsInTopic";
    ItemImpressionsMetadata["TotalNumberOfItems"] = "totalNumberOfItems";
})(ItemImpressionsMetadata || (ItemImpressionsMetadata = {}));
var UserImpressionsMetadata;
(function (UserImpressionsMetadata) {
    UserImpressionsMetadata["Presences"] = "presences";
    UserImpressionsMetadata["PresenceUniverseIds"] = "presenceUniverseIds";
    UserImpressionsMetadata["FriendStatuses"] = "friendStatuses";
    UserImpressionsMetadata["SourceCarousel"] = "sourceCarousel";
})(UserImpressionsMetadata || (UserImpressionsMetadata = {}));

var ItemActionMetadata;
(function (ItemActionMetadata) {
    ItemActionMetadata["ItemId"] = "itemId";
    ItemActionMetadata["ItemPosition"] = "itemPosition";
    ItemActionMetadata["RowNumber"] = "rowNumber";
    ItemActionMetadata["FeedRowNumber"] = "feedRowNumber";
    ItemActionMetadata["PositionInRow"] = "positionInRow";
    ItemActionMetadata["PositionInTopic"] = "positionInTopic";
    ItemActionMetadata["TotalNumberOfItems"] = "totalNumberOfItems";
    ItemActionMetadata["ActionType"] = "actionType";
})(ItemActionMetadata || (ItemActionMetadata = {}));
var UserActionMetadata;
(function (UserActionMetadata) {
    UserActionMetadata["Presence"] = "presence";
    UserActionMetadata["PresenceUniverseId"] = "presenceUniverseId";
    UserActionMetadata["FriendStatus"] = "friendStatus";
    UserActionMetadata["SourceCarousel"] = "sourceCarousel";
})(UserActionMetadata || (UserActionMetadata = {}));

const parseEventParamValue = (value, shouldParseArraysWithoutQuotes // false for legacy implementation for existing events
) => {
    if (Array.isArray(value) && !shouldParseArraysWithoutQuotes) {
        return value.join(',');
    }
    if (typeof value === 'object' && value) {
        return JSON.stringify(value);
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    return undefined;
};
/**
 * Parses event params of an unknown type to a string or number for the event stream.
 *
 * Note: This function diverges from the parseEventParams() in web-frontend due to
 * the handling of arrays. The web-frontend version will add an extra set of quotation
 * marks around each string value due to the "JSON.stringify()", which results in
 * the downstream data stable having these extra quotation marks around each string.
 * However, existing events should use the legacy implementation below to avoid
 * breaking changes to pipelines that expect the extra quotation marks.
 */
const parseEventParams = (params) => {
    return Object.keys(params).reduce((acc, key) => {
        const parsedValue = parseEventParamValue(params[key], false);
        if (parsedValue !== undefined) {
            acc[key] = parsedValue;
        }
        return acc;
    }, {});
};

export { ContentType, EventContext, EventNames, FriendStatus, ItemActionMetadata, ItemImpressionsMetadata, SessionInfo, SharedEventMetadata, UserActionMetadata, UserImpressionsMetadata, UserPresence, elementVisibilityService, parseEventParams, useCollectionItemsIntersectionTracker };
