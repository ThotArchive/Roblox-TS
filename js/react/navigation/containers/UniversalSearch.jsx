import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslations, usePrevious, useDebounce } from 'react-utilities';
import { httpService, pageName } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import { SearchLandingService, ExperimentationService, Endpoints } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { translationConfig } from '../translation.config';
import SearchInput from '../components/SearchInput';
import layout from '../constants/layoutConstants';
import linkConstants from '../constants/linkConstants';
import search from '../constants/searchConstants';
import searchService, { GamesAutocompleteSuggestionEntryType } from '../services/searchService';
import events from '../constants/searchEventStreamConstants';
import navigationUtil from '../util/navigationUtil';
import searchUtil from '../util/searchUtil';
import searchConfigConstants from '../constants/configConstants';

export function UniversalSearch({ translate, isUniverseSearchShown }) {
  const [searchInput, setSearchInput] = useState(
    navigationUtil.parseQuery(window.location.search).keyword || ''
  );

  const debouncedSearchInput = useDebounce(searchInput, search.debounceTimeout);
  const previousDebouncedSearchInput = usePrevious(debouncedSearchInput);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState(null);
  const [autocompleteSessionInfo, setAutocompleteSessionInfo] = useState(
    events.generateSessionInfo()
  );
  const [searchLandingPageSessionInfo, setSearchLandingPageSessionInfo] = useState(
    events.generateSessionInfo()
  );
  const hasFetchedSearchLandingPageExperimentValuesRef = useRef(false);
  const [isSearchLandingEnabled, setIsSearchLandingEnabled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialCall, setIsInitialCall] = useState(true);
  const [isMenuHover, setIsMenuHover] = useState(false);
  const [indexOfSelectedOption, setSelectedListOptions] = useState(0);
  const [useAvatarAutocompletFallbackUrl, setUseAvatarAutocompletFallbackUrl] = useState(false);
  const { keyCodes } = layout;

  const [universalSearchLinks, setUniversalSearchLinks] = useState(
    search.isAutocompleteSuggestionsIXPTestEnabled()
      ? navigationUtil.getNewUniversalSearchLinks()
      : navigationUtil.getUniversalSearchLinks()
  );
  const gameSearchLinkIndex = universalSearchLinks.findIndex(
    ({ label }) => label === linkConstants.gameSearchLink.label
  );
  const avatarShopSearchLinkIndex = navigationUtil
    .getNewUniversalSearchLinks()
    .findIndex(({ label }) => label === linkConstants.avatarSearchLink.label);
  const userLanguageCode = searchUtil.getAvatarAutocompleteLanguageCode();

  const showAvatarAutocompleteSuggestions = navigationUtil.getAvatarAutocompleteSearchLinks();
  const constructSearchSuggestions = additionalSuggestions => {
    if (additionalSuggestions) {
      if (showAvatarAutocompleteSuggestions) {
        const showAvatarSearchLink =
          autocompleteSuggestions.findIndex(
            suggestion =>
              suggestion.searchQuery === debouncedSearchInput.toLowerCase() &&
              searchUtil.isAvatarAutocompleteSuggestion(suggestion)
          ) === -1;
        const avatarSplicedSuggestions = additionalSuggestions.filter(
          suggestion =>
            suggestion.searchQuery !== debouncedSearchInput.toLowerCase() ||
            searchUtil.isAvatarAutocompleteSuggestion(suggestion)
        );
        return [
          ...universalSearchLinks.slice(
            0,
            showAvatarSearchLink ? avatarShopSearchLinkIndex + 1 : avatarShopSearchLinkIndex
          ),
          ...avatarSplicedSuggestions,
          ...universalSearchLinks.slice(avatarShopSearchLinkIndex + 1)
        ];
      }
      if (search.isSpecialTreatmentAutocompleteRestricted()) {
        return universalSearchLinks;
      }
      const showGameSearchLink =
        additionalSuggestions.findIndex(
          suggestion =>
            suggestion.searchQuery === debouncedSearchInput.toLowerCase() &&
            suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion
        ) === -1;
      const splicedSuggestions = additionalSuggestions
        .filter(
          suggestion =>
            suggestion.searchQuery !== debouncedSearchInput.toLowerCase() ||
            suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion
        )
        .slice(
          0,
          search.isSpecialTreatment()
            ? search.numberOfSpecialTreatmentAutocompleteSuggestions
            : search.numberOfAutocompleteSuggestions()
        );

      return [
        ...universalSearchLinks.slice(
          0,
          showGameSearchLink ? gameSearchLinkIndex + 1 : gameSearchLinkIndex
        ),
        ...splicedSuggestions,
        ...universalSearchLinks.slice(gameSearchLinkIndex + 1)
      ];
    }
    return universalSearchLinks;
  };

  const searchSuggestions = useMemo(() => {
    return constructSearchSuggestions(autocompleteSuggestions);
  }, [autocompleteSuggestions, universalSearchLinks]);

  const processAvatarShopAutocompleteSuggestions = (avatarShopSuggestions, query) => {
    let suggestionCount = 0;
    const cleanedSuggestions = [];
    avatarShopSuggestions.forEach(suggestion => {
      if (
        suggestionCount < search.avatarAutocompleteSuggestionLimit &&
        suggestion.Query !== query
      ) {
        cleanedSuggestions.push(suggestion);
        suggestionCount += 1;
      }
    });

    return cleanedSuggestions;
  };

  const searchSuggestionLength = searchSuggestions.length;
  useEffect(() => {
    // prevents sending a search event when the component is just being mounted
    if (!isInitialCall) {
      eventStreamService.sendEvent(
        ...events.search(
          searchInput,
          events.contexts.searchAutocomplete,
          events.actionTypes.submit,
          autocompleteSessionInfo
        )
      );
    }
    setIsInitialCall(false);

    const getAutocompleteSuggestion = async () => {
      if (
        debouncedSearchInput !== undefined &&
        debouncedSearchInput !== '' &&
        debouncedSearchInput.length <= search.debouncedSearchInputMaxLength
      ) {
        setAutocompleteSuggestions(null);
        const start = Date.now();

        if (showAvatarAutocompleteSuggestions) {
          try {
            const end = Date.now();
            const data = await searchService.getAvatarRequestSuggestion(
              debouncedSearchInput,
              userLanguageCode,
              search.avatarAutocompleteQueryPaddingAmount,
              previousDebouncedSearchInput,
              useAvatarAutocompletFallbackUrl
            );
            const constructedSuggestions = processAvatarShopAutocompleteSuggestions(
              data.Data,
              debouncedSearchInput
            );
            eventStreamService.sendEvent(
              ...events.searchAutocomplete(
                debouncedSearchInput,
                previousDebouncedSearchInput,
                false,
                constructedSuggestions,
                data.Args.Algo,
                end - start,
                search.debounceTimeout,
                '',
                pageName.PageNameProvider.getInternalPageName(),
                previousDebouncedSearchInput !== ''
              )
            );
            setAutocompleteSuggestions(constructedSuggestions);
          } catch (error) {
            if (!httpService.isCancelled(error)) {
              setAutocompleteSuggestions([]);
            }
            setUseAvatarAutocompletFallbackUrl(true);
          }
        } else if (search.isAutocompleteSuggestionsIXPTestEnabled()) {
          try {
            const data = await searchService.getSearchSuggestion(debouncedSearchInput);
            const end = Date.now();
            const seenSuggestions = constructSearchSuggestions(data.entries);
            eventStreamService.sendEvent(
              ...events.searchAutocomplete(
                debouncedSearchInput,
                previousDebouncedSearchInput,
                false,
                searchUtil.serializeSuggestions(seenSuggestions, debouncedSearchInput),
                data.algorithmName,
                end - start,
                search.debounceTimeout,
                autocompleteSessionInfo,
                pageName.PageNameProvider.getInternalPageName(),
                false
              )
            );
            setAutocompleteSuggestions(data.entries);
          } catch (error) {
            if (!httpService.isCancelled(error)) {
              setAutocompleteSuggestions([]);
            }
          }
        }
      }
    };

    if (showAvatarAutocompleteSuggestions) {
      setUniversalSearchLinks(navigationUtil.getNewUniversalSearchLinks());
    }

    getAutocompleteSuggestion();
  }, [debouncedSearchInput]);

  const resetAutocompleteSessionInfo = () => {
    setAutocompleteSessionInfo(events.generateSessionInfo());
  };

  const resetSearchLandingPageSessionInfo = () => {
    const newSearchLandingSessionInfo = events.generateSessionInfo();
    setSearchLandingPageSessionInfo(newSearchLandingSessionInfo);
    SearchLandingService.updateSessionInfo(newSearchLandingSessionInfo);
  };

  const resetSessionInfo = () => {
    resetAutocompleteSessionInfo();
    resetSearchLandingPageSessionInfo();
  };

  const handleSearch = ({ target: { value } }) => {
    if (value.length < searchInput.length) {
      eventStreamService.sendEvent(
        ...events.searchTextTrim(searchInput, value, undefined, autocompleteSessionInfo)
      );
    }

    // Reset autocomplete session info when the search input goes from non-empty to empty
    if (searchInput.length > 0 && value.length === 0) {
      resetAutocompleteSessionInfo();
      if (isSearchLandingEnabled) {
        SearchLandingService.showSearchLanding(searchLandingPageSessionInfo);
        eventStreamService.sendEvent(
          ...events.search(
            undefined,
            events.contexts.searchLandingPage,
            events.actionTypes.open,
            searchLandingPageSessionInfo
          )
        );
      }
    }
    // Send autocomplete open event when the search input goes from empty to non-empty
    if (searchInput.length === 0 && value.length > 0) {
      const newAutoCompleteSessionInfo = events.generateSessionInfo();
      eventStreamService.sendEvent(
        ...events.search(
          value,
          events.contexts.searchAutocomplete,
          events.actionTypes.open,
          newAutoCompleteSessionInfo
        )
      );
      setAutocompleteSessionInfo(newAutoCompleteSessionInfo);
    }

    setSelectedListOptions(0);
    setIsMenuOpen(value.length > 0);
    setSearchInput(value);
  };

  const openSearchLandingOrAutocompleteResults = useCallback(
    isSLPEnabled => {
      // If the search input is empty, show the search landing page if its enabled
      if (isSLPEnabled && searchInput.length === 0) {
        const newSearchLandingSessionInfo = events.generateSessionInfo();
        SearchLandingService.showSearchLanding(newSearchLandingSessionInfo);
        eventStreamService.sendEvent(
          ...events.search(
            undefined,
            events.contexts.searchLandingPage,
            events.actionTypes.open,
            newSearchLandingSessionInfo
          )
        );
        setSearchLandingPageSessionInfo(newSearchLandingSessionInfo);
      } else {
        // else log an autocomplete open event and wait for user input to show autocomplete results
        const newAutoCompleteSessionInfo = events.generateSessionInfo();
        eventStreamService.sendEvent(
          ...events.search(
            searchInput,
            events.contexts.searchAutocomplete,
            events.actionTypes.open,
            newAutoCompleteSessionInfo
          )
        );
        setAutocompleteSessionInfo(newAutoCompleteSessionInfo);
      }
      if ((!isSLPEnabled && searchInput.length === 0) || isMenuHover) return;
      // Set the menu to open if slp enabled and search input is empty or slp is disabled and search input is not empty (autocomplete results shown)
      setIsMenuOpen(true);
    },
    [isMenuHover, searchInput]
  );

  const openMenu = useCallback(() => {
    // On search bar click determine whether to show search landing page via experiment value
    if (!hasFetchedSearchLandingPageExperimentValuesRef.current) {
      ExperimentationService.getAllValuesForLayer('PlayerApp.HomePage.UX.WholePageRanking')
        .then(values => {
          const isEnabled = values?.shouldShowSearchLandingPageWeb ?? false;
          setIsSearchLandingEnabled(isEnabled);
          openSearchLandingOrAutocompleteResults(isEnabled);
        })
        .catch(() => {
          fireEvent(searchConfigConstants.searchLandingPageExperimentFetchError);
          openSearchLandingOrAutocompleteResults(false);
        })
        .finally(() => {
          hasFetchedSearchLandingPageExperimentValuesRef.current = true;
        });
    } else {
      openSearchLandingOrAutocompleteResults(isSearchLandingEnabled);
    }
  }, [isSearchLandingEnabled, openSearchLandingOrAutocompleteResults]);

  const closeMenu = () => {
    if (!isMenuOpen) {
      return;
    }

    if (isSearchLandingEnabled && searchInput.length === 0) {
      eventStreamService.sendEvent(
        ...events.search(
          null,
          events.contexts.searchLandingPage,
          events.actionTypes.cancel,
          searchLandingPageSessionInfo
        )
      );
    } else {
      eventStreamService.sendEvent(
        ...events.search(
          searchInput,
          events.contexts.searchAutocomplete,
          events.actionTypes.close,
          autocompleteSessionInfo
        )
      );
    }

    setIsMenuOpen(false);
  };

  const onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown = e => {
    let currentCursor = indexOfSelectedOption;
    if (
      isMenuOpen &&
      (e.keyCode === keyCodes.arrowUp ||
        e.keyCode === keyCodes.arrowDown ||
        e.keyCode === keyCodes.tab)
    ) {
      e.stopPropagation();
      e.preventDefault();

      if (e.keyCode === keyCodes.arrowUp) {
        currentCursor -= 1;
      } else {
        currentCursor += 1;
      }

      currentCursor %= searchSuggestionLength;
      if (currentCursor < 0) {
        currentCursor = searchSuggestionLength + currentCursor;
      }
      setSelectedListOptions(currentCursor);
    }
  };

  const onKeyUp = e => {
    if (e.keyCode === keyCodes.enter) {
      e.stopPropagation();
      e.preventDefault();
      // Prevent form submits on enter when SLP is visible / nothing is typed
      if (isSearchLandingEnabled && searchInput.length === 0) return;

      const suggestion = searchSuggestions[indexOfSelectedOption];

      if (searchUtil.isAutocompleteSuggestion(suggestion)) {
        eventStreamService.sendEvent(
          ...events.searchSuggestionClicked(
            debouncedSearchInput,
            undefined,
            indexOfSelectedOption,
            suggestion.searchQuery,
            searchUtil.getAutocompleteSearchType(suggestion),
            searchUtil.serializeSuggestions(searchSuggestions, searchInput),
            autocompleteSessionInfo
          )
        );
        eventStreamService.sendEvent(
          ...events.catalogSearch(1, pageName.PageNameProvider.getInternalPageName())
        );
      } else {
        eventStreamService.sendEvent(
          ...events.searchSuggestionClicked(
            debouncedSearchInput,
            undefined,
            indexOfSelectedOption,
            debouncedSearchInput,
            searchUtil.getDefaultSearchType(suggestion),
            searchUtil.serializeSuggestions(searchSuggestions, searchInput),
            autocompleteSessionInfo
          )
        );
        eventStreamService.sendEvent(
          ...events.catalogSearch(0, pageName.PageNameProvider.getInternalPageName())
        );
      }
      resetAutocompleteSessionInfo();
      const suggestionUrl = searchUtil.getSuggestionUrl(suggestion, e);
      if (suggestionUrl) {
        const { isRedirectLibraryToCreatorMarketplaceEnabled } = search;
        let redirectUrl = suggestionUrl;
        if (
          suggestion.label === 'Label.CreatorMarketplace' &&
          isRedirectLibraryToCreatorMarketplaceEnabled()
        ) {
          const { creatorMarketplaceUrl } = linkConstants;
          redirectUrl = creatorMarketplaceUrl;
          if (e?.target?.value) {
            redirectUrl += encodeURIComponent(e.target.value);
          }
        }

        if (document.getElementById('routing')) {
          const url = new URL(redirectUrl);
          if (
            url.origin === window.location.origin &&
            Endpoints.removeUrlLocale(url.pathname).toLowerCase() === '/catalog'
          ) {
            const customEvent = new CustomEvent('externalNavigation', {
              detail: { url: redirectUrl }
            });
            window.dispatchEvent(customEvent);
            // close auto completes and unfocus the input
            setIsMenuOpen(false);
            document.getElementById('navbar-search-input').blur();
            return;
          }
        }

        window.location = redirectUrl;
      }
    }
  };

  const setSearchMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    window.addEventListener('setSearchMenuClose', setSearchMenuClose);
    return () => {
      window.removeEventListener('setSearchMenuClose', setSearchMenuClose);
    };
  }, [isMenuOpen]);

  return (
    <SearchInput
      {...{
        searchInput,
        handleSearch,
        isSearchLandingEnabled,
        openMenu,
        closeMenu,
        setIsMenuHover,
        isMenuOpen,
        indexOfSelectedOption,
        onSubmit,
        onKeyDown,
        onKeyUp,
        isUniverseSearchShown,
        translate,
        searchSuggestions,
        autocompleteSessionInfo,
        resetSessionInfo,
        isAvatarAutocompleteEnabled: showAvatarAutocompleteSuggestions
      }}
    />
  );
}

UniversalSearch.defaultProps = {
  isUniverseSearchShown: true
};

UniversalSearch.propTypes = {
  translate: PropTypes.func.isRequired,
  isUniverseSearchShown: PropTypes.bool
};

export const UniversalSearchContainer = withTranslations(UniversalSearch, translationConfig);
