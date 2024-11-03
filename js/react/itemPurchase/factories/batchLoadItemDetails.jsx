import { useState, useEffect, useCallback } from 'react';
import { authenticatedUser } from 'header-scripts';
import { ItemDetailsHydrationService, TDetailEntry, TItemDetailRequestEntry } from 'Roblox';
import itemDetailsService from '../services/itemDetailsService';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import itemDetailParsingUtils from '../util/itemDetailParsingUtils';
import ItemType from '../../../../ts/react/enums/ItemType';

const { errorMessages, maxBatchLoadRetries } = itemPurchaseConstants;
const {
  parseItemDetails,
  parseResellerDetails,
  parseItemPurchasableDetails,
  parseItemPurchasableNonAuthDetails
} = itemDetailParsingUtils;

function BatchLoadItemDetails(items) {
  const [economyMetadata, setEconomyMetadata] = useState();
  const [itemDetails, setItemDetails] = useState([]);
  const [cachedItems, setCachedItems] = useState({});
  let failureCount = 0;

  const setItemLoadFailure = () => {
    if (failureCount < maxBatchLoadRetries) {
      batchLoadItemDetails();
      failureCount += 1;
    } else {
      setItemDetails([
        {
          loading: false,
          loadFailure: true
        }
      ]);
    }
  };

  const loadEconomyMetadata = useCallback(() => {
    if (!authenticatedUser.isAuthenticated) {
      const unauthedEconomyMetadata = {
        data: {
          isMarketplaceEnabled: false,
          isItemsXchangeEnabled: false
        }
      };
      setEconomyMetadata(unauthedEconomyMetadata);
      return;
    }
    itemDetailsService
      .getEconomyMetadata()
      .then(metadata => {
        setEconomyMetadata(metadata);
      })
      .catch(() => {
        setItemLoadFailure();
      });
  }, []);

  async function parseResult(data) {
    if (data.inCache) {
      return cachedItems[data.itemType.toLowerCase()][data.id];
    }
    let item = parseItemDetails({}, data);
    if (item.isLimited) {
      try {
        const res = await itemDetailsService.getResellerDetail(item.id);
        item = parseResellerDetails(item, res);
      } catch {
        item.resellerAvailable = false;
      }
    }
    if (data.productId !== undefined) {
      if (authenticatedUser.isAuthenticated) {
        if (item.collectibleItemId === undefined) {
          const res = await itemDetailsService.getItemPurchasableDetail(data.productId);
          item = parseItemPurchasableDetails(item, res.data, economyMetadata);
        }
      } else {
        item = parseItemPurchasableNonAuthDetails(item);
      }
    }

    return item;
  }

  async function processItemDetails(data) {
    try {
      const result = await Promise.all(data.map(item => parseResult(item)));
      setItemDetails(result);

      const newAllFetchedItems = cachedItems;
      result.forEach(item => {
        if (!item.isLimited && !cachedItems[item.itemType.toLowerCase()][item.id]) {
          // Limited data inherently needs to be "fresher" since resellers change frequently
          // So we will not save this data
          newAllFetchedItems[item.itemType.toLowerCase()][item.id] = item;
        }
      });
      setCachedItems(newAllFetchedItems);
    } catch (e) {
      setItemLoadFailure();
    }
  }

  async function fetchItemDetails() {
    const nonCachedItems = [];
    items.forEach(item => {
      if (cachedItems[item.itemType.toLowerCase()][item.id] === undefined) {
        nonCachedItems.push(item);
      }
    });
    let result;
    if (nonCachedItems.length > 0) {
      const itemsToHydrate = [];
      nonCachedItems.map(item =>
        itemsToHydrate.push({
          itemType: item.itemType,
          id: item.id
        })
      );
      result = await ItemDetailsHydrationService.getItemDetails(itemsToHydrate, false, true);
    }
    const itemDetailsResult = [];
    items.forEach(item => {
      if (cachedItems[item.itemType.toLowerCase()][item.id] === undefined) {
        const foundItem = result.find(i => {
          return i.id === item.id && i.itemType.toLowerCase() === item.itemType.toLowerCase();
        });
        if (foundItem) {
          itemDetailsResult.push(foundItem);
        }
      } else {
        itemDetailsResult.push({ id: item.id, itemType: item.itemType, inCache: true });
      }
    });
    return itemDetailsResult;
  }

  const batchLoadItemDetails = useCallback(() => {
    fetchItemDetails()
      .then(function handleResult(result) {
        try {
          processItemDetails(result);
        } catch {
          setItemLoadFailure();
        }
      })
      .catch(() => {
        setItemLoadFailure();
      });
  }, [economyMetadata, items, parseResult]);

  useEffect(() => {
    const baseFetchedItemsObject = {};
    baseFetchedItemsObject[ItemType.Asset] = {};
    baseFetchedItemsObject[ItemType.Bundle] = {};
    setCachedItems(baseFetchedItemsObject);
    loadEconomyMetadata();
  }, []);

  useEffect(() => {
    if (economyMetadata !== undefined) {
      batchLoadItemDetails();
    }
  }, [economyMetadata, items]);

  return {
    itemDetails,
    batchLoadItemDetails
  };
}

export default BatchLoadItemDetails;
