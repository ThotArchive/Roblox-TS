import thumbnail2dService from '../../../../ts/2d/services/thumbnail2d';
import thumbnailsModule from '../thumbnailsModule';

function thumbnailService($q) {
  'ngInject';

  const getThumbnailImage = (thumbnailType, targetId, size, format) => {
    return $q((resolve, reject) => {
      thumbnail2dService
        .getThumbnailImage(thumbnailType, size, format, targetId)
        .then(image => {
          resolve(image);
        })
        .catch(reject);
    });
  };

  const reloadThumbnailImage = (thumbnailType, targetId, size) => {
    return $q((resolve, reject) => {
      thumbnail2dService
        .reloadThumbnailImage(thumbnailType, size, null, targetId)
        .then(image => {
          resolve(image);
        })
        .catch(reject);
    });
  };

  const getCssClass = thumbnailState => {
    return thumbnail2dService.getCssClass(thumbnailState);
  };

  return {
    getThumbnailImage,
    getCssClass,
    reloadThumbnailImage
  };
}

thumbnailsModule.factory('thumbnailService', thumbnailService);

export default thumbnailService;
