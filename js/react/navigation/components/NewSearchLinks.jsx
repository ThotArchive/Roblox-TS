import React from 'react';
import PropTypes from 'prop-types';
import { eventStreamService } from 'core-roblox-utilities';
import { pageName } from 'core-utilities';
import searchUtil from '../util/searchUtil';
import { AutocompleteSearchLink, AvatarAutocompleteSearchLink, SearchLink } from './SearchLink';
import events from '../constants/searchEventStreamConstants';

function NewSearchLinks({
  translate,
  searchInput,
  indexOfSelectedOption,
  searchSuggestions,
  autocompleteSessionInfo,
  resetSessionInfo
}) {
  const onClick = (suggestionType, index) => () => {
    const suggestion = searchSuggestions[index];
    eventStreamService.sendEvent(
      ...events.searchSuggestionClicked(
        searchInput,
        undefined,
        index,
        searchUtil.isAutocompleteSuggestion(suggestion) ? suggestion.searchQuery : searchInput,
        suggestionType,
        searchUtil.serializeSuggestions(searchSuggestions, searchInput),
        autocompleteSessionInfo
      )
    );
    resetSessionInfo();

    const isAutocomplete = suggestionType.includes('default') ? 0 : 1;
    eventStreamService.sendEvent(
      ...events.catalogSearch(isAutocomplete, pageName.PageNameProvider.getInternalPageName())
    );
  };
  return searchSuggestions.map((suggestion, index) => {
    const selected = parseInt(index, 10) === indexOfSelectedOption;
    if (
      searchUtil.isAutocompleteSuggestion(suggestion) &&
      searchUtil.isAvatarAutocompleteSuggestion(suggestion)
    ) {
      return (
        <AvatarAutocompleteSearchLink
          key={suggestion.Query}
          translate={translate}
          selected={selected}
          suggestion={suggestion}
          onClick={onClick(searchUtil.getAutocompleteSearchType(suggestion), index)}
        />
      );
    }
    if (searchUtil.isAutocompleteSuggestion(suggestion)) {
      return (
        <AutocompleteSearchLink
          key={suggestion.searchQuery}
          translate={translate}
          selected={selected}
          suggestion={suggestion}
          onClick={onClick(searchUtil.getAutocompleteSearchType(suggestion), index)}
        />
      );
    }
    return (
      <SearchLink
        key={suggestion.url}
        translate={translate}
        selected={selected}
        suggestion={suggestion}
        searchInput={searchInput}
        onClick={onClick(searchUtil.getDefaultSearchType(suggestion), index)}
      />
    );
  });
}

NewSearchLinks.propTypes = {
  translate: PropTypes.func.isRequired,
  searchInput: PropTypes.string.isRequired,
  indexOfSelectedOption: PropTypes.number.isRequired,
  searchSuggestions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        type: PropTypes.number.isRequired,
        score: PropTypes.number.isRequired,
        universeId: PropTypes.number.isRequired,
        canonicalTitle: PropTypes.string,
        thumbnailUrl: PropTypes.string,
        searchQuery: PropTypes.string.isRequired,
        trendingSearchStartDateTime: PropTypes.string
      }),
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        pageSort: PropTypes.arrayOf(PropTypes.string).isRequired,
        icon: PropTypes.string.isRequired
      }),
      PropTypes.shape({
        Query: PropTypes.string.isRequired,
        Score: PropTypes.number.isRequired
      })
    ])
  ).isRequired,
  autocompleteSessionInfo: PropTypes.string.isRequired,
  resetSessionInfo: PropTypes.func.isRequired
};

export default NewSearchLinks;
