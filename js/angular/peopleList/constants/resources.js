import { EnvironmentUrls, DeviceMeta } from 'Roblox';
import peopleListModule from '../peopleListModule';

const resources = {
  templateUrls: {
    peopleListContainer: 'people-list-container',
    peopleList: 'people-list',
    peopleInfoCard: 'people-info-card',
    people: 'people'
  },
  apiSets: {
    getFriendsListUrl: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.friendsApi}/v1/users/{userId}/friends`
        : '/v1/users/{userId}/friends',
      retryable: true,
      withCredentials: true
    },
    getMetadataUrl: {
      url: EnvironmentUrls ? `${EnvironmentUrls.friendsApi}/v1/metadata` : '/v1/metadata',
      retryable: true,
      withCredentials: true
    },
    getPresences: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.presenceApi}/v1/presence/users`
        : '/v1/presence/users',
      retryable: true,
      withCredentials: true
    },
    multiGetPlaceDetails: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.gamesApi}/v1/games/multiget-place-details`
        : '/v1/games/multiget-place-details',
      retryable: true,
      withCredentials: true
    },
    multiGetGameIcons: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.gamesApi}/v1/games/game-thumbnails`
        : '/v1/games/game-thumbnails',
      retryable: true,
      withCredentials: true
    }
  },
  apiParams: {
    avatarMultiGetLimit: 100,
    presenceMultiGetLimit: 100
  },
  gameIconSize: {
    lg: {
      width: 150,
      height: 150
    }
  },
  eventStreamParams: {
    goToProfileFromAvatar: {
      name: 'goToProfileFromAvatar',
      ctx: 'click'
    },
    goToProfileInPeopleList: {
      name: 'goToProfileFromPeopleList',
      ctx: 'click'
    },
    openPeopleList: {
      name: 'openPeopleList',
      ctx: 'hover'
    },
    goToChatInPeopleList: {
      name: 'goToChatFromPeopleList',
      ctx: 'click'
    },
    joinGameInPeopleList: {
      name: 'joinGameInPeopleList',
      ctx: 'click'
    },
    goToGameDetailFromAvatar: {
      name: 'goToGameDetailFromAvatar',
      ctx: 'click'
    },
    goToGameDetailInPeopleList: {
      name: 'goToGameDetailInPeopleList',
      ctx: 'click'
    },
    gamePlayIntentInPeopleList: {
      ctx: 'peopleListInHomePage'
    },
    gameImpressions: {
      name: 'gameImpressions',
      ctx: 'hover'
    },
    sessionInfoTypes: {
      homePageSessionInfo: 'homePageSessionInfo'
    },
    pageContexts: {
      peopleListInHomePage: 'peopleListInHomePage'
    }
  },
  hoverPopoverParams: {
    isOpen: false,
    triggerSelector: '',
    hoverPopoverSelector: '',
    isDisabled: DeviceMeta ? !DeviceMeta().isDesktop || DeviceMeta().isUWPApp : false
  },
  reasonProhibitedMessage: {
    None: 'None',
    PurchaseRequired: 'PurchaseRequired'
  },
  peopleInfoCardContainerClass: 'card-with-game'
};

peopleListModule.constant('resources', resources);

export default resources;
