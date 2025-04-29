import $ from 'jquery';
import angular from 'angular';
import chatModule from '../chatModule';

function cookieService($log) {
  'ngInject';

  return {
    isCookieDefined(key) {
      return angular.isDefined($.cookie(key)) && $.cookie(key);
    },

    updateCookie(key, value, cookieOption) {
      $.cookie(key, JSON.stringify(value), cookieOption);
    },

    retrieveCookie(key) {
      return this.isCookieDefined(key) ? JSON.parse($.cookie(key)) : [];
    },

    destroyCookie(key, cookieOption) {
      $.cookie(key, null, cookieOption);
    }
  };
}

chatModule.factory('cookieService', cookieService);

export default cookieService;
