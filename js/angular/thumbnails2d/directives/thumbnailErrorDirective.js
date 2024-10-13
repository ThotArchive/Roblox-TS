import thumbnailsModule from '../thumbnailsModule';

function thumbnailError() {
  'ngInject';

  return {
    scope: {
      thumbnailError: '<'
    },
    link(scope, elem) {
      elem.on('error', scope.thumbnailError);
    }
  };
}

thumbnailsModule.directive('thumbnailError', thumbnailError);

export default thumbnailError;
