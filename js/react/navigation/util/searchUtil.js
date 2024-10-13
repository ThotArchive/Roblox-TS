import { TranslationResourceProvider } from 'Roblox';
import links from '../constants/linkConstants';
import searchConstants from '../constants/searchConstants';
import { GamesAutocompleteSuggestionEntryType } from '../services/searchService';

const isAutocompleteSuggestion = suggestion => suggestion?.label === undefined;
const isAvatarAutocompleteSuggestion = suggestion => suggestion?.Query !== undefined;
const isKeywordSuggestion = suggestion =>
  isAutocompleteSuggestion(suggestion) &&
  suggestion.type === GamesAutocompleteSuggestionEntryType.QuerySuggestion;
const isGameSuggestion = suggestion =>
  isAutocompleteSuggestion(suggestion) &&
  suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion;

const getAutocompleteSearchType = suggestion => {
  if (isAvatarAutocompleteSuggestion(suggestion)) {
    return 'avatar';
  }
  switch (suggestion.type) {
    case GamesAutocompleteSuggestionEntryType.QuerySuggestion: {
      return 'keyword';
    }
    case GamesAutocompleteSuggestionEntryType.GameSuggestion: {
      return 'game';
    }
    default: {
      throw Error(`Unrecognized autocomplete suggestion, ${JSON.stringify(suggestion)}`);
    }
  }
};

const getDefaultSearchType = suggestion => {
  switch (suggestion.label) {
    case 'Label.Players': {
      return 'defaultPlayers';
    }
    case 'Heading.Marketplace':
    case 'Label.AvatarShop':
    case 'Label.sCatalog': {
      return 'defaultShops';
    }
    case 'Label.sGroups': {
      return 'defaultGroups';
    }
    case 'Label.CreatorMarketplace': {
      return 'defaultLibrary';
    }
    case 'Label.Experience': {
      return 'defaultGames';
    }
    default: {
      throw Error(`Unrecognized default suggestion, ${JSON.stringify(suggestion)}`);
    }
  }
};

const getSuggestionUrl = (suggestion, event) => {
  if (isAutocompleteSuggestion(suggestion) && isAvatarAutocompleteSuggestion(suggestion)) {
    return links.avatarSearchLink.url + encodeURIComponent(suggestion.Query);
  }
  if (isAutocompleteSuggestion(suggestion)) {
    return links.gameSearchLink.url + encodeURIComponent(suggestion.searchQuery);
  }
  if (event?.target?.value) {
    return suggestion.url + encodeURIComponent(event.target.value);
  }

  return '';
};

const getAvatarAutocompleteLanguageCode = () => {
  const translationProvider = new TranslationResourceProvider();
  let { locale } = translationProvider.intl;
  const regionChar = locale.indexOf('-');
  locale = locale.substring(0, regionChar !== -1 ? regionChar : locale.length);
  if (locale !== searchConstants.englishLanguageCode) {
    locale += `,${searchConstants.englishLanguageCode}`;
  }
  return locale;
};

const serializeSuggestions = (suggestions, searchInput) =>
  suggestions
    .map(suggestion => {
      if (isAutocompleteSuggestion(suggestion)) {
        return `${getAutocompleteSearchType(suggestion)}|${suggestion.searchQuery}`;
      }
      return `${getDefaultSearchType(suggestion)}|${searchInput}`;
    })
    .join(',');

export default {
  isAutocompleteSuggestion,
  isAvatarAutocompleteSuggestion,
  isGameSuggestion,
  isKeywordSuggestion,
  getAutocompleteSearchType,
  getDefaultSearchType,
  getSuggestionUrl,
  getAvatarAutocompleteLanguageCode,
  serializeSuggestions
};
