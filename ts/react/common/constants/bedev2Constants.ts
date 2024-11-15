import { EnvironmentUrls } from 'Roblox';
import UrlConfig from '../../../../../../Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/http/interfaces/UrlConfig';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getOmniRecommendations: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation`,
    withCredentials: true
  },
  getOmniRecommendationsMetadata: {
    url: `${apiGatewayUrl}/discovery-api/omni-recommendation-metadata`,
    withCredentials: true
  },
  getOmniSearch: {
    url: `${apiGatewayUrl}/search-api/omni-search`,
    withCredentials: true
  },
  getExploreSorts: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sorts`,
    withCredentials: true
  },
  getExploreSortContents: {
    url: `${apiGatewayUrl}/explore-api/v1/get-sort-content`,
    withCredentials: true
  },
  getSurvey: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/prompts`,
    withCredentials: true
  }),
  postSurveyResults: (locationName: string): UrlConfig => ({
    url: `${apiGatewayUrl}/rocap/v1/locations/${locationName}/annotations`,
    withCredentials: true
  }),
  getGuacAppPolicyBehaviorData: (): UrlConfig => ({
    url: `${apiGatewayUrl}/universal-app-configuration/v1/behaviors/app-policy/content`,
    withCredentials: true
  })
};

export default {
  url
};
