import React, { createRef, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SearchLandingService } from 'Roblox';
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
  handleSearchOpenOrInputChange,
  closeMenu,
  setIsMenuHover,
  indexOfSelectedOption,
  onSubmit,
  onKeyDown,
  onKeyUp,
  isUniverseSearchShown,
  searchSuggestions,
  isSearchLandingEnabled,
  autocompleteSessionInfo,
  resetSessionInfo,
  isAvatarAutocompleteEnabled
}) {
  const inputRef = createRef();
  const dropdownRef = createRef();
  const searchLandingRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchLandingEmpty, setIsSearchLandingEmpty] = useState(true);

  useEffect(() => {
    const onSetSearchLandingHasContent = () => {
      setIsSearchLandingEmpty(false);
    };
    // Sent from SearchLandingOmniFeed if there are recommendations to show
    // as we don't want the search overlay to show if there are no recommendations
    // and the user is just focused on the search input
    // Copied event name from Roblox.Games.WebApp/ts/react/searchLandingPage/service/modalConstants.ts
    window.addEventListener('SetSearchLandingHasContent', onSetSearchLandingHasContent);
    return () => {
      window.removeEventListener('SetSearchLandingHasContent', onSetSearchLandingHasContent);
    };
  }, []);

  const isClearingInputRef = useRef(false);
  const clearSearch = useCallback(() => {
    eventStreamService.sendEvent(
      ...events.searchClear(
        searchInput,
        undefined,
        autocompleteSessionInfo,
        pageName?.PageNameProvider?.getInternalPageName()
      )
    );
    isClearingInputRef.current = true;
    inputRef?.current?.focus();
    handleSearchOpenOrInputChange('');
  }, [autocompleteSessionInfo, inputRef, handleSearchOpenOrInputChange, searchInput]);

  const onFocus = useCallback(() => {
    setIsFocused(true);
    // clearSearch already calls handleSearchOpenOrInputChange so skip the onFocus event
    if (isClearingInputRef.current) {
      isClearingInputRef.current = false;
      return;
    }
    handleSearchOpenOrInputChange();
  }, [handleSearchOpenOrInputChange]);

  const onBlur = () => {
    setIsFocused(false);
  };

  const onChange = useCallback(
    e => {
      handleSearchOpenOrInputChange(e.target.value);
    },
    [handleSearchOpenOrInputChange]
  );

  const menuClassName = classNames(
    'navbar-left navbar-search col-xs-5 col-sm-6 col-md-2 col-lg-3',
    {
      'navbar-search-open': isSearchLandingEnabled
        ? isMenuOpen && searchInput.length > 0
        : isMenuOpen,
      shown: isUniverseSearchShown
    }
  );

  const searchLandingClassName = classNames('search-landing-root', {
    'search-landing-root-open': isSearchLandingEnabled && searchInput.length === 0 && isFocused
  });

  // Only show the search overlay if the SLP has recommendations or autocomplete results are being shown
  const showOverlay =
    isFocused && ((!isSearchLandingEmpty && searchInput.length === 0) || searchInput.length > 0);
  const searchOverlayClassName = classNames('search-overlay', {
    'search-overlay-show': showOverlay
  });

  // jpark 3/4/2022 Avatar Shop Autocomplete is fully enabled - this check can be removed when this IXP test code is cleaned up
  const showNewSearchLinks =
    searchConstants.isAutocompleteSuggestionsIXPTestEnabled() || isAvatarAutocompleteEnabled;

  const refs = useMemo(() => {
    const baseRefs = [inputRef, dropdownRef];
    if (isSearchLandingEnabled) {
      baseRefs.push(searchLandingRef.current);
    }
    return baseRefs;
  }, [dropdownRef, inputRef, isSearchLandingEnabled, searchLandingRef]);

  useOnClickOutside(refs, closeMenu);

  useEffect(() => {
    if (searchLandingRef.current) {
      SearchLandingService.mountSearchLanding();
    }
  }, [searchLandingRef]);

  return (
    <React.Fragment>
      <div data-testid='navigation-search-input' className={menuClassName} role='search'>
        <div className='input-group'>
          <form name='search-form' onSubmit={onSubmit} action='/search'>
            {/* TODO CLIGROW-2225 clean up dead experiment */}
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
                  onChange={onChange}
                  placeholder={translate('Label.sSearch')}
                  maxLength='120'
                  onFocus={onFocus}
                  onBlur={onBlur}
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
                onChange={onChange}
                placeholder={translate('Label.sSearch')}
                maxLength='120'
                onFocus={onFocus}
                onBlur={onBlur}
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
              resetSessionInfo={resetSessionInfo}
            />
          ) : (
            <SearchLinks
              translate={translate}
              searchInput={searchInput}
              indexOfSelectedOption={indexOfSelectedOption}
              autocompleteSessionInfo={autocompleteSessionInfo}
              resetSessionInfo={resetSessionInfo}
            />
          )}
        </ul>
        <div
          ref={searchLandingRef}
          id='search-landing-root'
          data-testid='search-landing-root'
          className={searchLandingClassName}
        />
      </div>
      {isSearchLandingEnabled && <div className={searchOverlayClassName} />}
    </React.Fragment>
  );
}

SearchInput.defaultProps = {
  isUniverseSearchShown: true,
  isAvatarAutocompleteEnabled: false,
  isSearchLandingEnabled: false
};

SearchInput.propTypes = {
  translate: PropTypes.func.isRequired,
  searchInput: PropTypes.string.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  handleSearchOpenOrInputChange: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
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
  isSearchLandingEnabled: PropTypes.bool,
  autocompleteSessionInfo: PropTypes.string.isRequired,
  resetSessionInfo: PropTypes.func.isRequired
};

export default SearchInput;
