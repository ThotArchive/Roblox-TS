import environmentUrls from "@rbx/environment-urls";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import itemCardConstants from "./constants/itemCardConstants";
import urlConfigs from "./constants/urlConfigs";

export const checkIfBundle = (itemType: string): boolean => {
  const simplifiedType = itemType.toLowerCase();

  return simplifiedType.includes(itemCardConstants.itemTypes.bundle);
};

export const getItemLink = (itemId: number, itemName: string, itemType: string): string => {
  let urlType = urlConfigs.assetRootUrlTemplate;
  if (checkIfBundle(itemType)) {
    urlType = urlConfigs.bundleRootUrlTemplate;
  }
  return `${environmentUrls.websiteUrl}/${urlType}/${itemId}/${formatSeoName(itemName)}`;
};

export const getProfileLink = (
  creatorId: number,
  creatorType: string,
  creatorName: string,
): string => {
  if (creatorType === "Group") {
    return `${environmentUrls.websiteUrl}/groups/${creatorId}/${formatSeoName(creatorName)}`;
  }
  return `${environmentUrls.websiteUrl}/users/${creatorId}/profile`;
};

export type ItemCardRestrictions = {
  isLimited: boolean;
  isRthro: boolean;
  isThirteenPlus: boolean;
  isLimitedUnique: boolean;
  isDynamicHead: boolean;
  isCollectible: boolean;
  itemRestrictionIcon: string;
};

export const mapItemRestrictionIcons = (
  itemRestrictions: string[] | undefined,
  itemType: string,
): ItemCardRestrictions => {
  const itemCardRestrictions: ItemCardRestrictions = {
    isLimited: false,
    isRthro: false,
    isThirteenPlus: false,
    isLimitedUnique: false,
    isDynamicHead: false,
    isCollectible: false,
    itemRestrictionIcon: "",
  };
  if (itemRestrictions) {
    const { itemRestrictionTypes, itemRestrictionIcons } = itemCardConstants;
    if (checkIfBundle(itemType)) {
      itemCardRestrictions.isLimited = itemRestrictions.includes(itemRestrictionTypes.limited);
      itemCardRestrictions.isRthro = itemRestrictions.includes(itemRestrictionTypes.rthro);
      itemCardRestrictions.isDynamicHead = itemRestrictions.includes(
        itemRestrictionTypes.dynamicHead,
      );
      itemCardRestrictions.isCollectible = itemRestrictions.includes(
        itemRestrictionTypes.collectible,
      );
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
      itemCardRestrictions.isThirteenPlus = itemRestrictions.includes(
        itemRestrictionTypes.thirteenPlus,
      );
      itemCardRestrictions.isLimitedUnique = itemRestrictions.includes(
        itemRestrictionTypes.limitedUnique,
      );
      itemCardRestrictions.isDynamicHead = itemRestrictions.includes(
        itemRestrictionTypes.dynamicHead,
      );
      itemCardRestrictions.isLimited = itemRestrictions.includes(itemRestrictionTypes.limited);
      itemCardRestrictions.isCollectible = itemRestrictions.includes(
        itemRestrictionTypes.collectible,
      );
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

export type ItemStatus = {
  isIcon: boolean;
  type: string;
  class: string;
  label: string;
};

export const mapItemStatusIconsAndLabels = (itemStatuses: string[] | undefined): ItemStatus[] => {
  const itemStatusIconsAndLabels: ItemStatus[] = [];
  if (itemStatuses) {
    const { itemStatusClasses, itemStatusIcons, itemStatusLabels, itemStatusTypes } =
      itemCardConstants;
    if (itemStatuses.includes(itemStatusTypes.SaleTimer)) {
      itemStatusIconsAndLabels.push({
        isIcon: true,
        type: itemStatusIcons.SaleTimer,
        class: "",
        label: "",
      });
    }
    if (itemStatuses.includes(itemStatusTypes.New)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.New,
        label: itemStatusLabels.New,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.Sale)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.Sale,
        label: itemStatusLabels.Sale,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.XboxExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.XboxExclusive,
        label: itemStatusLabels.XboxExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.AmazonExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.AmazonExclusive,
        label: itemStatusLabels.AmazonExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.GooglePlayExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.GooglePlayExclusive,
        label: itemStatusLabels.GooglePlayExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.IosExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: "",
        class: itemStatusClasses.IosExclusive,
        label: itemStatusLabels.IosExclusive,
      });
    }
  }
  return itemStatusIconsAndLabels;
};
