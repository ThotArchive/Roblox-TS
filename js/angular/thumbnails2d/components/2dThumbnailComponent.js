import thumbnailsModule from '../thumbnailsModule';

const thumbnail2d = {
  templateUrl: '2d-thumbnail',
  bindings: {
    thumbnailType: '<',
    thumbnailTargetId: '<',
    thumbnailOptions: '<?',
    onSuccess: '<',
    onFailure: '<',
    altName: '<'
  },
  controller: '2dThumbnailController'
};

thumbnailsModule.component('thumbnail2d', thumbnail2d);

export default thumbnail2d;
