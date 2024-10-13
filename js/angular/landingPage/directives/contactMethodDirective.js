import landingPageModule from '../landingPageModule.js';

function contactMethod() {
  'ngInject';

  return {
    templateUrl: 'contact-method'
  };
}

landingPageModule.directive('contactMethod', contactMethod);

export default contactMethod;
