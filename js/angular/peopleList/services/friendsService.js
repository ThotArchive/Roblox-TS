import peopleListModule from '../peopleListModule';

function friendsService($q, resources, httpService, $filter) {
  'ngInject';

  const { apiSets } = resources;
  return {
    getFriendsList(userId) {
      const { url } = apiSets.getFriendsListUrl;
      apiSets.getFriendsListUrl.url = $filter('formatString')(url, { userId });
      return httpService.httpGet(apiSets.getFriendsListUrl);
    },

    buildBatchPromises(arrayNeedsBatch, cutOff, urlConfig, isPost) {
      const promises = [];
      let startIndex = 0;
      let subArray = arrayNeedsBatch.slice(startIndex, cutOff);
      while (subArray.length > 0) {
        const params = {
          userIds: subArray
        };
        if (isPost) {
          promises.push(httpService.httpPost(urlConfig, params));
        } else {
          promises.push(httpService.httpGet(urlConfig, params));
        }
        startIndex++;
        subArray = arrayNeedsBatch.slice(startIndex * cutOff, startIndex * cutOff + cutOff);
      }

      return $q.all(promises);
    },

    getPresences(userIds) {
      const { presenceMultiGetLimit } = resources.apiParams;

      return this.buildBatchPromises(
        userIds,
        presenceMultiGetLimit,
        apiSets.getPresences,
        true
      ).then(function(data) {
        if (data && data.length > 0) {
          let presences = [];
          angular.forEach(data, function(item) {
            const presenceData = item.userPresences;
            presences = presences.concat(presenceData);
          });
          return presences;
        }
        return null;
      });
    },

    getMetadata(targetUserId) {
      const params = {
        targetUserId
      };
      return httpService.httpGet(apiSets.getMetadataUrl, params);
    }
  };
}

peopleListModule.factory('friendsService', friendsService);

export default friendsService;
