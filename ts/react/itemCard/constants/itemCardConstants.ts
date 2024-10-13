const itemCardConstants = {
  robloxSystemUserId: 1,
  itemRestrictionTypes: {
    thirteenPlus: 'ThirteenPlus',
    limitedUnique: 'LimitedUnique',
    limited: 'Limited',
    rthro: 'Rthro',
    dynamicHead: 'Live',
    collectible: 'Collectible'
  },
  itemRestrictionIcons: {
    limited: 'icon-limited-label',
    limitedUnique: 'icon-limited-unique-label',
    dynamicHead: 'icon-default-dynamichead',
    collectible: 'icon-limited-unique-label',
    // NOTE (10/08/21, jpark):
    // Disabling rthro and thirteen plus here to preserve the feature until it is completely removed
    thirteenPlus: /* 'icon-thirteen-plus-label' */ '',
    thirteenPlusLimited: /* 'icon-thirteen-plus-limited-label' */ '',
    thirteenPlusLimitedUnique: /* 'icon-thirteen-plus-limited-unique-label' */ '',
    rthroLabel: /* 'icon-rthro-label' */ '',
    rthroLimitedLabel: /* 'icon-rthro-limited-label' */ ''
  },
  itemTypes: {
    bundle: 'bundle',
    asset: 'asset'
  },
  itemStatusTypes: {
    New: 'New',
    Sale: 'Sale',
    XboxExclusive: 'XboxExclusive',
    AmazonExclusive: 'AmazonExclusive',
    GooglePlayExclusive: 'GooglePlayExclusive',
    IosExclusive: 'IosExclusive',
    SaleTimer: 'SaleTimer'
  },
  itemStatusClasses: {
    New: 'status-new',
    Sale: 'status-sale',
    XboxExclusive: 'status-default has-text',
    AmazonExclusive: 'status-default has-text',
    GooglePlayExclusive: 'status-default has-text',
    IosExclusive: 'status-default has-text'
  },
  itemStatusHasIcons: ['SaleTimer'],
  itemStatusIcons: {
    SaleTimer: 'icon-clock'
  },
  itemStatusLabels: {
    Sale: 'Label.Sale',
    New: 'Label.New',
    XboxExclusive: 'Label.Xbox',
    AmazonExclusive: 'Label.Amazon',
    GooglePlayExclusive: 'Label.GoogleOnly',
    IosExclusive: 'Label.AppleOnly'
  }
};

export default itemCardConstants;
