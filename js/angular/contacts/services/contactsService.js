import angular from 'angular';
import contactsModule from '../contactsModule';

function contactsService(apiParamsInitialization, httpService, localStorageService) {
  'ngInject';

  const options = {
    default: 'default', // return data if present in the cache, otherwise fetch data and rehydrate cache
    skipCache: 'skipCache', // request fresh data and rehydrate the cache
    noCache: 'noCache' // request fresh data and don't rehydrate the cache
  };

  let contactsMetadata = {};

  function fetchUserContacts(userIds, opt) {
    const contactsCacheKey = 'aliases';
    const contactsMultiGetLimit = contactsMetadata.multiGetContactsMaxSize;
    const contactsCacheTTL = contactsMetadata.multiGetContactsCacheTTLinMS;
    const contactsUrlConfig = apiParamsInitialization.apiSets.multiGetContacts;

    const aliases = localStorageService.fetchNonExpiredCachedData(
      contactsCacheKey,
      contactsCacheTTL
    );
    if (aliases && aliases.data && opt === options.default) {
      return Promise.resolve(aliases.data);
    }
    const resp = httpService.buildBatchPromises(
      contactsUrlConfig,
      userIds,
      contactsMultiGetLimit,
      'targetUserIds',
      'POST'
    );
    if (opt !== options.noCache) {
      resp.then(data => {
        if (data && data.length > 0) {
          localStorageService.saveDataByTimeStamp(contactsCacheKey, data);
        }
      });
    }
    return resp;
  }

  return {
    getContactsMetaData() {
      const params = {};
      return httpService
        .httpGet(apiParamsInitialization.apiSets.getContactsMetadata, params)
        .then(data => (contactsMetadata = data));
    },

    getUserContacts(userIds, friendsDict, opt = options.default) {
      return fetchUserContacts(userIds, opt).then(function (data) {
        if (data && data.length > 0) {
          let contacts = [];
          contacts = [...contacts, ...data[0]];
          contacts.forEach(function (contact) {
            const userId = contact.targetUserId;
            if (!friendsDict[userId]) {
              friendsDict[userId] = {};
            }
            friendsDict[userId].contact = contact.targetUserTag;
          });
        }
      });
    },
    options
  };
}

contactsModule.factory('contactsService', contactsService);

export default contactsService;
