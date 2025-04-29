import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getExperimentationValues: (
    projectId: number,
    layerName: string,
    values: string[]
  ): { url: string; withCredentials: boolean } => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ','
    )}`,
    withCredentials: true
  })
};

const layerNames = {
  homePage: 'PlayerApp.HomePage.UX',
  homePageWeb: 'Website.Homepage',
  serverTab: 'GameDetails.ServersTab',
  gameDetails: 'Website.GameDetails',
  gameDetailsExposure: 'Website.GameDetails.Exposure',
  searchPage: 'Website.SearchResultsPage',
  discoverPage: 'Website.GamesPage',
  tileLayer: 'Website.TileLayer',
  playButton: 'Website.PlayButton'
};

const defaultValues = {
  homePage: {},
  homePageWeb: {
    IsExpandHomeContentEnabled: true,
    IsCarouselHorizontalScrollEnabled: false,
    IsNewScrollArrowsEnabled: false
  },
  serverTab: {
    ShouldDisableJoinButtonForFullServers: false
  },
  gameDetails: {
    ShouldHidePrivateServersInAboutTab: false,
    IsGameStorePreviewEnabled: false
  },
  gameDetailsExposure: {
    IsEventsSectionUprankEnabled: false,
    IsEventsSectionRedesignEnabled: false
  },
  searchPage: {
    ShouldUseOmniSearchAPI: false
  },
  discoverPage: {
    IsChartsPageRenameEnabled: true
  },
  tileLayer: {},
  playButton: {
    HasUpdatedPlayButtons: false,
    HasUpdatedPlayButtonsVpc: false
  }
};

export default {
  url,
  defaultValues,
  layerNames
};
