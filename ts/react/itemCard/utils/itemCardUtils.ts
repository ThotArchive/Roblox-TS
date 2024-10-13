import { seoName } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import itemCardConstants from '../constants/itemCardConstants';
import urlConfigs from '../constants/urlConfigs';

export const checkIfBundle = (itemType: string): boolean => {
  const simplifiedType = itemType.toLowerCase();

  return simplifiedType.includes(itemCardConstants.itemTypes.bundle);
};

export const getItemLink = (itemId: number, itemName: string, itemType: string): string => {
  let urlType = urlConfigs.assetRootUrlTemplate;
  if (checkIfBundle(itemType)) {
    urlType = urlConfigs.bundleRootUrlTemplate;
  }
  return `${EnvironmentUrls.websiteUrl}/${urlType}/${itemId}/${seoName.formatSeoName(itemName)}`;
};

export const getProfileLink = (
  creatorId: number,
  creatorType: string,
  creatorName: string
): string => {
  if (creatorType === 'Group') {
    return `${EnvironmentUrls.websiteUrl}/groups/${creatorId}/${seoName.formatSeoName(
      creatorName
    )}`;
  }
  return `${EnvironmentUrls.websiteUrl}/users/${creatorId}/profile`;
};

export type TItemCardRestrictions = {
  isLimited: boolean;
  isRthro: boolean;
  isThirteenPlus: boolean;
  isLimitedUnique: boolean;
  isDynamicHead: boolean;
  isCollectible: boolean;
  itemRestrictionIcon: string;
};

export const mapItemRestrictionIcons = (
  itemRestrictions: Array<string> | undefined,
  itemType: string
): TItemCardRestrictions => {
  const itemCardRestrictions: TItemCardRestrictions = {
    isLimited: false,
    isRthro: false,
    isThirteenPlus: false,
    isLimitedUnique: false,
    isDynamicHead: false,
    isCollectible: false,
    itemRestrictionIcon: ''
  };
  if (itemRestrictions) {
    const { itemRestrictionTypes, itemRestrictionIcons } = itemCardConstants;
    if (checkIfBundle(itemType)) {
      itemCardRestrictions.isLimited = itemRestrictions.indexOf(itemRestrictionTypes.limited) > -1;
      itemCardRestrictions.isRthro = itemRestrictions.indexOf(itemRestrictionTypes.rthro) > -1;
      itemCardRestrictions.isDynamicHead =
        itemRestrictions.indexOf(itemRestrictionTypes.dynamicHead) > -1;
      itemCardRestrictions.isCollectible =
        itemRestrictions.indexOf(itemRestrictionTypes.collectible) > -1;
      if (itemCardRestrictions.isLimited) {
        itemCardRestrictions.itemRestrictionIcon = itemCardRestrictions.isRthro
          ? itemRestrictionIcons.rthroLimitedLabel
          : itemRestrictionIcons.limited;
      } else if (itemCardRestrictions.isRthro) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.rthroLabel;
      } else if (itemCardRestrictions.isDynamicHead) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.dynamicHead;
      } else if (itemCardRestrictions.isCollectible) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.collectible;
      }
    } else {
      itemCardRestrictions.isThirteenPlus =
        itemRestrictions.indexOf(itemRestrictionTypes.thirteenPlus) > -1;
      itemCardRestrictions.isLimitedUnique =
        itemRestrictions.indexOf(itemRestrictionTypes.limitedUnique) > -1;
      itemCardRestrictions.isDynamicHead =
        itemRestrictions.indexOf(itemRestrictionTypes.dynamicHead) > -1;
      itemCardRestrictions.isLimited = itemRestrictions.indexOf(itemRestrictionTypes.limited) > -1;
      itemCardRestrictions.isCollectible =
        itemRestrictions.indexOf(itemRestrictionTypes.collectible) > -1;
      if (itemCardRestrictions.isLimitedUnique) {
        itemCardRestrictions.itemRestrictionIcon = itemCardRestrictions.isThirteenPlus
          ? itemRestrictionIcons.thirteenPlusLimitedUnique
          : itemRestrictionIcons.limitedUnique;
      } else if (itemCardRestrictions.isLimited) {
        itemCardRestrictions.itemRestrictionIcon = itemCardRestrictions.isThirteenPlus
          ? itemRestrictionIcons.thirteenPlusLimited
          : itemRestrictionIcons.limited;
      } else if (itemCardRestrictions.isThirteenPlus) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.thirteenPlus;
      } else if (itemCardRestrictions.isDynamicHead) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.dynamicHead;
      } else if (itemCardRestrictions.isCollectible) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.collectible;
      }
    }
  }
  return itemCardRestrictions;
};

export type TItemStatus = {
  isIcon: boolean;
  type: string;
  class: string;
  label: string;
};

export const mapItemStatusIconsAndLabels = (
  itemStatuses: Array<string> | undefined
): Array<TItemStatus> => {
  const itemStatusIconsAndLabels: TItemStatus[] = [];
  if (itemStatuses) {
    const {
      itemStatusClasses,
      itemStatusIcons,
      itemStatusLabels,
      itemStatusTypes
    } = itemCardConstants;
    if (itemStatuses.indexOf(itemStatusTypes.SaleTimer) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: true,
        type: itemStatusIcons.SaleTimer,
        class: '',
        label: ''
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.New) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.New,
        label: itemStatusLabels.New
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.Sale) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.Sale,
        label: itemStatusLabels.Sale
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.XboxExclusive) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.XboxExclusive,
        label: itemStatusLabels.XboxExclusive
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.AmazonExclusive) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.AmazonExclusive,
        label: itemStatusLabels.AmazonExclusive
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.GooglePlayExclusive) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.GooglePlayExclusive,
        label: itemStatusLabels.GooglePlayExclusive
      });
    }
    if (itemStatuses.indexOf(itemStatusTypes.IosExclusive) > -1) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: '',
        class: itemStatusClasses.IosExclusive,
        label: itemStatusLabels.IosExclusive
      });
    }
  }
  return itemStatusIconsAndLabels;
};

export default {
  getItemLink,
  getProfileLink,
  checkIfBundle,
  mapItemRestrictionIcons,
  mapItemStatusIconsAndLabels
};
