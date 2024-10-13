import { Hybrid } from 'Roblox';
import angularJsUtilitiesModule from '../angularJsUtilitiesModule';

function hybridService($log) {
  'ngInject';

  function isHybridValid() {
    return Hybrid && Hybrid.Bridge;
  }

  return {
    startChatConversation(params, callback) {
      // Android
      if (isHybridValid() && Hybrid.Chat) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }
        Hybrid.Chat.startChatConversation(params, callback);
      }
    },

    startWebChatConversation(params, callback) {
      // iOS
      if (isHybridValid() && Hybrid.Navigation) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }
        Hybrid.Navigation.startWebChatConversation(params, callback);
      }
    },

    navigateToFeature(params, callback) {
      if (isHybridValid() && Hybrid.Navigation) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }
        Hybrid.Navigation.navigateToFeature(params, callback);
      }
    },

    openUserProfile(params, callback) {
      if (isHybridValid() && Hybrid.Navigation) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }
        Hybrid.Navigation.openUserProfile(params, callback);
      }
    },

    close(callback) {
      if (isHybridValid() && Hybrid.Overlay) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }
        Hybrid.Overlay.close(callback);
      }
    },

    launchGame(params, callback) {
      if (isHybridValid() && Hybrid.Game) {
        if (angular.isUndefined(callback)) {
          callback = function() {};
        }

        Hybrid.Game.launchGame(params, callback);
      }
    }
  };
}
angularJsUtilitiesModule.factory('hybridService', hybridService);

export default hybridService;
