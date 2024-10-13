import { EnvironmentUrls, ReactLandingService, ReactLandingEventService } from 'Roblox';
import landingPageModule from '../landingPageModule';

function landingPageController(
  $scope,
  $window,
  landingPageConstants,
  modalService,
  languageResource
) {
  'ngInject';

  $scope.landingLayout = {
    googlePlayStoreLink: EnvironmentUrls.googlePlayStoreLink,
    amazonStoreLink: EnvironmentUrls.amazonStoreLink,
    appStoreLink: EnvironmentUrls.appStoreLink,
    windowsStoreLink: EnvironmentUrls.windowsStoreLink,
    xboxStoreLink: EnvironmentUrls.xboxStoreLink,
    loginLink: EnvironmentUrls.websiteUrl + landingPageConstants.urls.login
  };

  $scope.appClick = ReactLandingEventService.sendAppClickEvent;

  $scope.loadContentRatingLogoPolicy = function () {
    ReactLandingService.getContentRatingLogoPolicy().then(
      response => {
        $scope.displayBrazilRatingLogo = response.displayBrazilRatingLogo;
        $scope.displayItalyRatingLogo = response.displayItalyRatingLogo;
      },
      error => {
        console.debug(error);
      }
    );
  };

  $scope.contentRatingLogoClick = function (country) {
    const modal = modalService.open({
      cssClass: landingPageConstants.modalConstants.modalDarkTheme,
      actionButtonClass: landingPageConstants.modalConstants.actionButtonTheme,
      titleText: languageResource.get('Heading.LeavingRoblox'),
      bodyText: languageResource.get('Description.ExternalWebsiteRedirect'),
      actionButtonShow: true,
      actionButtonText: languageResource.get('Action.Continue'),
      neutralButtonText: languageResource.get('Action.Cancel')
    });

    let ratingGuideUrl;
    switch (country) {
      case 'brazil':
        ratingGuideUrl = landingPageConstants.urls.brazilContentRatingGuide;
        break;
      case 'italy':
        ratingGuideUrl = landingPageConstants.urls.italyContentRatingGuide;
        break;
      default:
        console.debug(`No rating guide URL exists for country: ${country}.`);
    }

    modal.result.then(function () {
      $window.open(ratingGuideUrl, '_blank');
    }, angular.noop);
  };

  $scope.isKoreaSignInVerification =
    $window.location.pathname === landingPageConstants.urls.koreaIdVerification;

  function init() {
    $scope.displayBrazilRatingLogo = false;
    $scope.displayItalyRatingLogo = false;
    $scope.loadContentRatingLogoPolicy();
  }

  init();
}

landingPageModule.controller('landingPageController', landingPageController);

export default landingPageController;
