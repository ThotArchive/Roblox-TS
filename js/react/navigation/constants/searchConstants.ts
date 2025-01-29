import { EnvironmentUrls } from 'Roblox';
import linkConstants from './linkConstants';

const { apiGatewayUrl, apiGatewayCdnUrl, localeApi } = EnvironmentUrls;
export const getNavigationContainer = () => document.getElementById('navigation-container');
export default {
  debounceTimeout: 100,
  debouncedSearchInputMaxLength: 35,
  expiryTimeout: 5000,
  variationId: 1,
  trendingVariationId: 0,
  avatarAutocompleteQueryPaddingAmount: 10,
  requestSuggestionUrl: {
    url: `${apiGatewayUrl}/games-autocomplete/v1/request-suggestion`,
    withCredentials: true
  },
  getSuggestionUrl: {
    url: `${apiGatewayUrl}/games-autocomplete/v1/get-suggestion/`,
    withCredentials: true
  },
  avatarRequestSuggestionUrl: {
    url: `${apiGatewayUrl}/autocomplete-avatar/v2/suggest`,
    withCredentials: true
  },
  avatarRequestSuggestionCdnUrl: {
    url: `${apiGatewayCdnUrl}/autocomplete-avatar/v2/suggest`,
    withCredentials: true
  },
  englishLanguageCode: 'en',
  avatarAutocompleteUrlLocations: ['Catalog', 'Trades', 'Inventory', 'Avatar', 'CatalogItem'],
  avatarAutocompleteSuggestionLimit: 5,
  isSpecialTreatmentAutocompleteRestricted: (): boolean =>
    parseInt(getNavigationContainer().dataset.numberOfAutocompleteSuggestions, 10) === 7 &&
    linkConstants.miscSearchLink
      .reduce<string[]>((acc, link) => {
        acc.push(...link.pageSort);
        return acc;
      }, [])
      .reduce((r, keyword) => {
        return r || window.location.pathname.indexOf(keyword) > -1;
      }, false),
  isSpecialTreatment: (): boolean =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions, 10) === 7,
  numberOfSpecialTreatmentAutocompleteSuggestions: 3,
  isAutocompleteSuggestionsIXPTestEnabled: (): boolean =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions, 10) > 0,
  numberOfAutocompleteSuggestions: (): number =>
    parseInt(getNavigationContainer()?.dataset.numberOfAutocompleteSuggestions, 10) || 0,
  isRedirectLibraryToCreatorMarketplaceEnabled: (): boolean =>
    getNavigationContainer()?.dataset.isRedirectLibraryToCreatorMarketplaceEnabled === 'True'
};
