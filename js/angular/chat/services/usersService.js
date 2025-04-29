import { Endpoints } from 'Roblox';
import angular from 'angular';
import chatModule from '../chatModule';

function usersService($q, apiParamsInitialization, httpService) {
  'ngInject';

  return {
    getAvatarHeadshots(userIds, friendsDict) {
      let avatarMultiGetLimit = 50;
      let avatarUrlConfig = apiParamsInitialization.apiSets.multiGetAvatarHeadshots;

      return httpService
        .buildBatchPromises(avatarUrlConfig, userIds, avatarMultiGetLimit, 'userIds')
        .then(function(data) {
          if (data && data.length > 0) {
            let avatars = [];
            angular.forEach(data, function(item) {
              avatars = avatars.concat(item.data);
            });

            angular.forEach(avatars, function(avatar) {
              let userId = avatar.targetId;
              if (!friendsDict[userId]) {
                friendsDict[userId] = {};
              }
              friendsDict[userId].avatarHeadshot = avatar;
            });
            return avatars;
          }
          return null;
        });
    },

    getUserPresence(userIds, friendsDict) {
      let presenceMultiGetLimit = 100;
      let presenceUrlConfig = apiParamsInitialization.apiSets.multiGetPresence;

      return httpService
        .buildBatchPromises(presenceUrlConfig, userIds, presenceMultiGetLimit, 'userIds', 'POST')
        .then(function(data) {
          if (data && data.length > 0) {
            let presences = [];
            angular.forEach(data, function(item) {
              let presenceData = item.userPresences;
              presences = presences.concat(presenceData);
            });
            presences.forEach(function(presence) {
              let {userId} = presence;
              if (!friendsDict[userId]) {
                friendsDict[userId] = {};
              }
              friendsDict[userId].presence = presence;
              if (Endpoints) {
                friendsDict[userId]['profileUrl'] = Endpoints.generateAbsoluteUrl(
                  '/users/{id}/profile',
                  { id: userId },
                  true
                );
              }
            });

            return presences;
          }
          return null;
        });
    },

    getUserInfo(userIds, friendsDict) {
      let promise = {
        avatarHeadshots: this.getAvatarHeadshots(userIds, friendsDict),
        presences: this.getUserPresence(userIds, friendsDict)
      };
      
      return $q.all(promise).then(function(payload) {
            return payload;
      });
    }
  }
}

chatModule.factory('usersService', usersService);

export default usersService;
