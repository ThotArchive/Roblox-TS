import { uuidService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;
const searchAutocompleteContext = 'searchAutocomplete';
const actionTypes = { open: 'open', submit: 'submit', close: 'close' };
const { generateRandomUuid: generateSessionInfo } = uuidService;

const eventStreamCriterias = {
  actionTypes,
  generateSessionInfo,
  searchTextTrim: (kwd, resultingKwd, searchType, sessionInfo) => [
    {
      name: 'searchTextTrim',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      kwd,
      resultingKwd,
      searchType,
      sessionInfo
    }
  ],
  searchClear: (kwd, searchType, sessionInfo, page) => [
    {
      name: 'searchClear',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      kwd,
      searchType,
      sessionInfo,
      page
    }
  ],
  searchSuggestionClicked: (
    kwd,
    searchType,
    suggestionPosition,
    suggestionClicked,
    suggestionType,
    suggestions,
    sessionInfo
  ) => [
    {
      name: 'searchSuggestionClicked',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      kwd,
      searchType,
      suggestionPosition,
      suggestionClicked,
      suggestionType,
      suggestions,
      sessionInfo
    }
  ],
  searchAutocomplete: (
    kwd,
    previousKwd,
    fromLocalCache,
    suggestions,
    algorithm,
    latency,
    timeoutDelayMs,
    sessionInfo,
    page,
    isPersonalizedBasedOnPreviousQuery
  ) => [
    {
      name: 'searchAutocomplete',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      kwd,
      previousKwd,
      fromLocalCache,
      suggestions,
      algorithm,
      latency,
      timeoutDelayMs,
      sessionInfo,
      page,
      isPersonalizedBasedOnPreviousQuery
    }
  ],
  search: (kwd, actionType, sessionInfo) => [
    {
      name: 'search',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      kwd,
      actionType,
      sessionInfo
    }
  ],
  catalogSearch: (autocompleteFlag, previousPage) => [
    {
      name: 'catalogSearch',
      type: eventTypes.formInteraction,
      context: searchAutocompleteContext
    },
    {
      autocompleteFlag,
      previousPage
    }
  ]
};

export { eventStreamCriterias as default };
