import angular from 'angular';
import { importFilesUnderPath, templateCacheGenerator } from 'roblox-es6-migration-helper';
import * as thumbnail2dConstants from './constants/thumbnail2dConstant';
import Thumbnail2d from '../../js/react/thumbnail2d/containers/Thumbnail2dContainer';
import Thumbnail2dCarouselContainer from '../../js/react/thumbnail2d/containers/Thumbnail2dCarouselContainer';
import thumbnailService from './services/thumbnail2d';

import '../../css/thumbnail2d/thumbnails.scss';

import '../../js/angular/vendors/angularLazyImg.js';

// import main module definition.
import thumbnailsModule from '../../js/angular/thumbnails2d/thumbnailsModule';

window.RobloxThumbnails = {
  Thumbnail2d,
  Thumbnail2dCarouselContainer,
  thumbnailService,
  ...thumbnail2dConstants
};

importFilesUnderPath(require.context('../../js/angular/thumbnails2d/components/', true, /\.js$/));
importFilesUnderPath(require.context('../../js/angular/thumbnails2d/constants/', true, /\.js$/));
importFilesUnderPath(require.context('../../js/angular/thumbnails2d/controllers/', true, /\.js$/));
importFilesUnderPath(require.context('../../js/angular/thumbnails2d/directives/', true, /\.js$/));
importFilesUnderPath(require.context('../../js/angular/thumbnails2d/services/', true, /\.js$/));

const templateContext = require.context('../../js/angular/thumbnails2d', true, /\.html$/);

templateCacheGenerator(angular, 'thumbnailsTemplates', templateContext, null);

export default thumbnailsModule;
