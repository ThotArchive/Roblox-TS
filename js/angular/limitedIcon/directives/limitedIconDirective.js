import limitedIconModule from '../limitedIconModule';

function limitedIcon() {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: {
      layoutOptions: '=layoutOptions'
    },
    templateUrl: 'limited-icon-container'
  };
}

limitedIconModule.directive('limitedIcon', limitedIcon);

export default limitedIcon;
