import angular from 'angular';
// this is v2
const thumbnails = angular.module('thumbnails', [
  'robloxApp',
  'thumbnailsTemplates',
  'angularLazyImg'
]);

export default thumbnails;
