import peopleListModule from '../peopleListModule';
import { getUrlUserId } from '../../../utils/appUtil';

function layoutService(languageResource, urlService, $filter, thumbnailConstants) {
  'ngInject';

  const gameDetailsUrl = '/games/{placeId}/gamename';
  const profileUrl = '/users/{userId}/profile';
  const lang = languageResource;

  return {
    sectionTitle: lang.get('Heading.Friends'), // "Friends"
    seeAllBtnText: lang.get('Heading.SeeAll'), // "See All",
    maxNumberOfFriendsDisplayed: 24,
    isAllFriendsDataLoaded: false,
    isAvatarDataLoaded: false,
    presenceTypes: {
      offline: {
        status: 0,
        className: ''
      },
      online: {
        status: 1,
        className: 'icon-online'
      },
      ingame: {
        status: 2,
        className: 'icon-game'
      },
      instudio: {
        status: 3,
        className: 'icon-studio'
      }
    },
    getFriendsPageUrl() {
      const profileUserId = getUrlUserId();
      if (profileUserId !== null) {
        return urlService.getAbsoluteUrl(`/users/${profileUserId}/friends`);
      }

      return urlService.getAbsoluteUrl('/users/friends');
    },
    getGameDetailsPageUrl(placeId) {
      const placeUrl = $filter('formatString')(gameDetailsUrl, { placeId });
      return urlService.getAbsoluteUrl(placeUrl);
    },
    getProfilePageUrl(userId) {
      const profilePageUrl = $filter('formatString')(profileUrl, { userId });
      return urlService.getAbsoluteUrl(profilePageUrl);
    },
    playButtons: {
      join: {
        type: 'join',
        text: lang.get('Action.Join'), // "Join",
        className: 'btn-growth-sm',
        isPlayable: true
      },
      buy: {
        type: 'buy',
        text: lang.get('Action.Buy'), // "Buy to Play",
        className: 'btn-primary-sm',
        isPlayable: false
      },
      details: {
        type: 'details',
        text: lang.get('Action.ViewDetails'), // "View Details",
        className: 'btn-control-sm',
        isPlayable: false
      }
    },
    interactionLabels: {
      chat(userName) {
        return lang.get('Label.Chat', { username: userName }); // "Chat with {username}",
      },
      viewProfile: lang.get('Label.ViewProfile') // "View Profile"
    },
    thumbnailTypes: thumbnailConstants.thumbnailTypes
  };
}

peopleListModule.factory('layoutService', layoutService);

export default layoutService;
