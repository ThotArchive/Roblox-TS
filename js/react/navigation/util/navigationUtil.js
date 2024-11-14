import { EventStream, RealTime } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import navigationService from '../services/navigationService';
import layoutConstants from '../constants/layoutConstants';
import links from '../constants/linkConstants';

const { universalSearchUrls, newUniversalSearchUrls, avatarSearchLink } = links;

const { unverifiedEmailGracePeriodInDaysBeforeNotification } = layoutConstants;
const isGuest = !authenticatedUser.isAuthenticated;

const isEmailNotificationEnabled = (userCreatedDate, isEmailVerified) => {
  const now = new Date();
  const created = new Date(userCreatedDate);
  const diffInDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffInDays > unverifiedEmailGracePeriodInDaysBeforeNotification && !isEmailVerified;
};

const getAccountNotificationCount = () => {
  // The last item that contributes to the setting notification counter was removed, but leaving this util in here for
  // now in case we want to add a new counter in the future.
  return Promise.resolve(0);
};

const sendClickEvent = eventName => {
  if (EventStream) {
    EventStream.SendEventWithTarget(eventName, 'click', {}, EventStream.TargetTypes.WWW);
  }
};

const subscribeToFriendsNotifications = handleFriendsEvent => {
  if (isGuest || !RealTime) {
    return () => {};
  }
  document.addEventListener(layoutConstants.friendEvents.requestCountChanged, handleFriendsEvent);
  const realTimeClient = RealTime.Factory.GetClient();
  realTimeClient.Subscribe(
    layoutConstants.friendEvents.friendshipNotifications,
    handleFriendsEvent
  );
  return () => {
    document.removeEventListener(
      layoutConstants.friendEvents.requestCountChanged,
      handleFriendsEvent
    );
    realTimeClient.Unsubscribe(
      layoutConstants.friendEvents.friendshipNotifications,
      handleFriendsEvent
    );
  };
};

const subscribeToMessagesNotifications = handleMessagesEvent => {
  if (isGuest || !RealTime) {
    return () => {};
  }
  document.addEventListener(layoutConstants.messagesCountChangeEvent, handleMessagesEvent);
  return () => {
    document.removeEventListener(layoutConstants.messagesCountChangeEvent, handleMessagesEvent);
  };
};

const isInMobileSize = () => {
  return window?.innerWidth < 543 ?? false; // breakpoint for mobile size
};

const getUniversalSearchLinks = () => {
  const linksCopy = [...universalSearchUrls];
  linksCopy.sort(({ pageSort }) => {
    const isRelevant = pageSort.reduce((r, keyword) => {
      return r || window.location.href.indexOf(keyword) > -1;
    }, false);
    if (isRelevant) {
      return -1;
    }
    return 1;
  });
  return linksCopy;
};

const getNewUniversalSearchLinks = () => {
  const urls = [...newUniversalSearchUrls];
  const relevantUrls = urls.filter(({ pageSort }) =>
    pageSort.some(keyword => window.location.pathname.indexOf(keyword) > -1)
  );
  const unRelevantUrls = urls.filter(({ pageSort }) =>
    pageSort.every(keyword => window.location.pathname.indexOf(keyword) === -1)
  );
  return [...relevantUrls, ...unRelevantUrls];
};

const getAvatarAutocompleteSearchLinks = () => {
  return avatarSearchLink.pageSort.some(keyword => window.location.pathname.indexOf(keyword) > -1);
};

const getThemeClass = () => {
  return (
    document.getElementById('navigation-container') &&
    document.getElementById('navigation-container').className
  );
};

const parseQuery = queryString => {
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  pairs.forEach(pair => {
    if (pair.includes('=')) {
      const [key, value] = pair.split('=');
      query[decodeURIComponent(key)?.toLowerCase()] = decodeURIComponent(value);
    }
  });
  return query;
};

export default {
  getAccountNotificationCount,
  sendClickEvent,
  subscribeToFriendsNotifications,
  subscribeToMessagesNotifications,
  isInMobileSize,
  getUniversalSearchLinks,
  getNewUniversalSearchLinks,
  getAvatarAutocompleteSearchLinks,
  getThemeClass,
  parseQuery
};
