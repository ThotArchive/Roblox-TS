import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { eventStreamService } from 'core-roblox-utilities';
import { Link } from 'react-style-guide';
import navigationUtil from '../util/navigationUtil';
import searchUtil from '../util/searchUtil';
import events from '../constants/searchEventStreamConstants';

function SearchLinks({
  translate,
  searchInput,
  indexOfSelectedOption,
  autocompleteSessionInfo,
  resetAutocompleteSessionInfo
}) {
  const universalSearchLinks = navigationUtil.getUniversalSearchLinks();
  return (
    <React.Fragment>
      {Object.entries(universalSearchLinks).map(([key, suggestion]) => {
        const { url, label } = suggestion;
        const listClass = ClassNames(
          'navbar-search-option rbx-clickable-li',
          parseInt(key, 10) === indexOfSelectedOption ? ' selected' : ''
        );
        return (
          <li key={key} className={listClass}>
            <Link
              className='navbar-search-anchor'
              url={url + searchInput}
              onClick={() => {
                eventStreamService.sendEvent(
                  ...events.searchSuggestionClicked(
                    searchInput,
                    undefined,
                    key,
                    searchInput,
                    searchUtil.getDefaultSearchType(suggestion),
                    searchUtil.serializeSuggestions(universalSearchLinks, searchInput),
                    autocompleteSessionInfo
                  )
                );
                resetAutocompleteSessionInfo();
              }}>
              {translate('Label.sSearchPhrase', {
                phrase: searchInput,
                location: translate(label)
              })}
            </Link>
          </li>
        );
      })}
    </React.Fragment>
  );
}

SearchLinks.propTypes = {
  translate: PropTypes.func.isRequired,
  searchInput: PropTypes.string.isRequired,
  indexOfSelectedOption: PropTypes.number.isRequired,
  autocompleteSessionInfo: PropTypes.string.isRequired,
  resetAutocompleteSessionInfo: PropTypes.func.isRequired
};

export default SearchLinks;
