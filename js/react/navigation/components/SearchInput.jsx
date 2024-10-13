import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { eventStreamService } from 'core-roblox-utilities';
import { useOnClickOutside } from 'react-utilities';
import { pageName } from 'core-utilities';
import SearchLinks from './SearchLinks';
import events from '../constants/searchEventStreamConstants';
import searchConstants from '../constants/searchConstants';
import NewSearchLinks from './NewSearchLinks';

function SearchInput({
  translate,
  searchInput,
  isMenuOpen,
  openMenu,
  closeMenu,
  handleSearch,
  setIsMenuHover,
  indexOfSelectedOption,
  onSubmit,
  onKeyDown,
  onKeyUp,
  isUniverseSearchShown,
  searchSuggestions,
  autocompleteSessionInfo,
  resetAutocompleteSessionInfo,
  isAvatarAutocompleteEnabled
}) {
  const inputRef = createRef();
  const dropdownRef = createRef();

  const clearSearch = () => {
    eventStreamService.sendEvent(
      ...events.searchClear(
        searchInput,
        undefined,
        autocompleteSessionInfo,
        pageName?.PageNameProvider?.getInternalPageName()
      )
    );
    inputRef?.current?.focus();
    handleSearch({ target: { value: '' } });
  };
  const menuClassName = classNames(
    'navbar-left navbar-search col-xs-5 col-sm-6 col-md-2 col-lg-3',
    {
      'navbar-search-open': isMenuOpen,
      shown: isUniverseSearchShown
    }
  );

  // jpark 3/4/2022 Avatar Shop Autocomplete is fully enabled - this check can be removed when this IXP test code is cleaned up
  const showNewSearchLinks =
    searchConstants.isAutocompleteSuggestionsIXPTestEnabled() || isAvatarAutocompleteEnabled;

  useOnClickOutside([inputRef, dropdownRef], closeMenu);
  return (
    <div data-testid='navigation-search-input' className={menuClassName} role='search'>
      <div className='input-group'>
        <form name='search-form' onSubmit={onSubmit} action='/search'>
          {showNewSearchLinks ? (
            <div className='form-has-feedback'>
              <input
                ref={inputRef}
                id='navbar-search-input'
                type='search'
                name='search-bar'
                data-testid='navigation-search-input-field'
                className='form-control input-field new-input-field'
                value={searchInput}
                onChange={handleSearch}
                placeholder={translate('Label.sSearch')}
                maxLength='120'
                onFocus={openMenu}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                autoComplete='off'
                autoCorrect='off'
                autoCapitalize='off'
                spellCheck='false'
              />
              {searchInput.length > 0 && (
                <span
                  data-testid='navigation-search-input-clear-button'
                  tabIndex={0}
                  role='button'
                  aria-label='Clear Search'
                  onClick={clearSearch}
                  onKeyDown={clearSearch}
                  className='clear-search icon-actions-clear-sm'>
                  <span />
                </span>
              )}
            </div>
          ) : (
            <input
              ref={inputRef}
              id='navbar-search-input'
              type='search'
              name='search-bar'
              data-testid='navigation-search-input-field'
              className='form-control input-field'
              value={searchInput}
              onChange={handleSearch}
              placeholder={translate('Label.sSearch')}
              maxLength='120'
              onFocus={openMenu}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              autoComplete='off'
            />
          )}
        </form>
        <div className='input-group-btn'>
          <button
            data-testid='navigation-search-input-search-button'
            className='input-addon-btn'
            type='submit'>
            <span className='icon-common-search-sm' />
          </button>
        </div>
      </div>
      <ul
        ref={dropdownRef}
        className={classNames('dropdown-menu', {
          'new-dropdown-menu': showNewSearchLinks
        })}
        role='menu'
        onMouseEnter={() => {
          setIsMenuHover(true);
        }}
        onMouseLeave={() => {
          setIsMenuHover(false);
        }}>
        {showNewSearchLinks ? (
          <NewSearchLinks
            translate={translate}
            searchInput={searchInput}
            indexOfSelectedOption={indexOfSelectedOption}
            searchSuggestions={searchSuggestions}
            autocompleteSessionInfo={autocompleteSessionInfo}
            resetAutocompleteSessionInfo={resetAutocompleteSessionInfo}
          />
        ) : (
          <SearchLinks
            translate={translate}
            searchInput={searchInput}
            indexOfSelectedOption={indexOfSelectedOption}
            autocompleteSessionInfo={autocompleteSessionInfo}
            resetAutocompleteSessionInfo={resetAutocompleteSessionInfo}
          />
        )}
      </ul>
    </div>
  );
}

SearchInput.defaultProps = {
  isUniverseSearchShown: true,
  isAvatarAutocompleteEnabled: false
};

SearchInput.propTypes = {
  translate: PropTypes.func.isRequired,
  searchInput: PropTypes.string.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  openMenu: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  setIsMenuHover: PropTypes.func.isRequired,
  indexOfSelectedOption: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func.isRequired,
  isUniverseSearchShown: PropTypes.bool,
  isAvatarAutocompleteEnabled: PropTypes.bool,
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
        icon: PropTypes.string
      }),
      PropTypes.shape({
        query: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired
      })
    ])
  ).isRequired,
  autocompleteSessionInfo: PropTypes.string.isRequired,
  resetAutocompleteSessionInfo: PropTypes.func.isRequired
};

export default SearchInput;
