export default {
  displayTypes: {
    large: 'large',
    small: 'small'
  },

  classNamesForHeaderLink: {
    large: 'hidden-xs hidden-sm col-md-5 col-lg-4',
    small: 'hidden-md hidden-lg col-xs-12'
  },

  keyCodes: {
    arrowUp: 38,
    arrowDown: 40,
    tab: 9,
    enter: 13
  },

  mainContentId: 'container-main',

  logoutEvent: {
    name: 'Roblox.Logout'
  },

  // this is a setting on the server
  unverifiedEmailGracePeriodInDaysBeforeNotification: 1,

  shopEvents: {
    clickMerchandise: 'clickMerchandiseInLeftNav',
    goToAmazonStore: 'clickContinueToAmazonStore'
  },
  friendEvents: {
    friendshipNotifications: 'FriendshipNotifications',
    requestCountChanged: 'Roblox.Friends.CountChanged',
    friendshipCreated: 'FriendshipCreated',
    friendshipDestroyed: 'FriendshipDestroyed',
    friendshipDeclined: 'FriendshipDeclined',
    friendshipRequested: 'FriendshipRequested'
  },
  messagesCountChangeEvent: {
    name: 'Roblox.Messages.CountChanged'
  },
  robuxOnEconomySystemOutage: '?',
  economySystemOutageMessage: 'Response.InternalServerErrorDescription',
  headerMenuIconClickEvent: {
    name: 'headerMenuIconClick'
  },
  menuKeys: {
    quickLogin: 'quickLogin',
    logout: 'logout',
    settings: 'settings',
    switchAccountKey: 'switchAccountKey'
  },
  truncateThreshold: {
    robuxTruncateThreshold: 10000,
    creditTruncateThreshold: 10000
  },
  creditDisplayConfigVariants: {
    control: 'control',
    hideCreditAndRobux: 'hideCreditAndRobux',
    showCreditAndRobux: 'showCreditAndRobux'
  },
  accountSwitchConfirmationKeys: {
    accountSwitchedFlag: 'RBXASAccountSwitched',
    accountSwitchedMessage: 'Description.AccountSwitchedConfirmationBannerText'
  }
};
