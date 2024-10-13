import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { ThumbnailMetrics } from "Roblox";
/*
 * When lazy load is enabled for all, this is the imageRetry we use
 *
 * Note: for disablePlaceholder to work, two conditions must be met.
 *     (1) the disable-placeholder flag on the image must be set to "true"
 *     (2) the src must be set to ""
 */
function imageRetry(robloxImagesService, $log) {
    "ngInject";
    return {
        restrict: 'A',
        scope: {
            thumbnail: "="
        },
        link: function (scope, element, attrs) {
            var getImage = function (thumbnail) {
                if (thumbnail && !thumbnail.Final) {
                    var startTime = new Date().getTime();
                    robloxImagesService.getImageUrl(thumbnail, function (imageUrl, isFinal) {
                        if (isFinal) {
                            var endTime = new Date().getTime();
                            ThumbnailMetrics.logFinalThumbnailTime(endTime - startTime);
                        }
                        else {
                            ThumbnailMetrics.ThumbnailMetrics.logThumbnailTimeout();
                        }
                        if (attrs.resetSrc) {
                            if (imageUrl) {
                                thumbnail.Url = imageUrl;
                            }
                        }
                        else {
                            //let's try to do lazy-img integration
                            if (attrs.src && attrs.src.length > 0 || attrs.disablePlaceholder) {
                                //if src is already set, that means we just change it
                                attrs.$set('src', imageUrl);
                                $log.debug("got final, setting src");
                            }
                            else {
                                //let's replace the lazy-img url
                                if (attrs.lazyImg) {
                                    attrs.$set('lazyImg', imageUrl);
                                    $log.debug("got final, setting lazyimg");
                                }
                            }
                        }
                    }, 0);
                }
            }

            getImage(scope.thumbnail);

            var watchDestroy = scope.$watch(
                function () {
                    return scope.thumbnail;
                },
                function (newValue) {
                    if (newValue) {
                        getImage(newValue);
                    }
                });

            scope.$on('$destroy', function () {
                if (watchDestroy) {
                    watchDestroy();
                }
            });
        }
    }
};

angularJsUtilitiesModule.directive("imageRetry", imageRetry);
export default imageRetry;