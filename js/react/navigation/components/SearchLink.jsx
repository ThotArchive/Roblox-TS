import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Link } from 'react-style-guide';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import { GamesAutocompleteSuggestionEntryType } from '../services/searchService';
import links from '../constants/linkConstants';
import searchConstants from '../constants/searchConstants';

const { gameSearchLink, avatarSearchLink, creatorMarketplaceUrl } = links;

export function AutocompleteSearchLink({ translate, selected, suggestion, onClick }) {
  const listClass = ClassNames('navbar-search-option rbx-clickable-li', {
    'new-selected': selected
  });
  const { type, universeId, searchQuery } = suggestion;
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);

  if (type === GamesAutocompleteSuggestionEntryType.GameSuggestion) {
    return (
      <li className={listClass}>
        <Link
          className='new-navbar-search-anchor'
          url={gameSearchLink.url + encodeURIComponent(searchQuery)}
          onClick={onClick}>
          <span className={ClassNames(gameSearchLink.icon, 'navbar-list-option-icon')} />
          <span className='navbar-list-option-text'>{searchQuery}</span>
          <span className='navbar-list-option-suffix'>
            {translate('Label.sSearchPhraseV2', {
              location: translate(gameSearchLink.label)
            })}
          </span>
          <span
            className={ClassNames('navbar-list-option-thumbnail', {
              'navbar-list-option-thumbnail-visible': isThumbnailVisible
            })}>
            <span className='background-icon' />
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={DefaultThumbnailSize}
              targetId={universeId}
              containerClass='thumbnail-icon'
              format={ThumbnailFormat.jpeg}
              onLoad={() => {
                setIsThumbnailVisible(true);
              }}
            />
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li className={listClass}>
      <Link
        className='new-navbar-search-anchor'
        url={gameSearchLink.url + encodeURIComponent(searchQuery)}
        onClick={onClick}>
        <span className={ClassNames(gameSearchLink.icon, 'navbar-list-option-icon')} />
        <span className='navbar-list-option-text'>{searchQuery}</span>
        <span className='navbar-list-option-suffix'>
          {translate('Label.sSearchPhraseV2', {
            location: translate(gameSearchLink.label)
          })}
        </span>
      </Link>
    </li>
  );
}

AutocompleteSearchLink.propTypes = {
  translate: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  suggestion: PropTypes.shape({
    type: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
    universeId: PropTypes.number,
    canonicalTitle: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    searchQuery: PropTypes.string.isRequired,
    trendingSearchStartDateTime: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export function AvatarAutocompleteSearchLink({ translate, selected, suggestion, onClick }) {
  const listClass = ClassNames('navbar-search-option rbx-clickable-li', {
    'new-selected': selected
  });
  const query = suggestion.Query;

  return (
    <li className={listClass}>
      <Link
        className='new-navbar-search-anchor'
        url={avatarSearchLink.url + encodeURIComponent(query)}
        onClick={onClick}>
        <span className={ClassNames(avatarSearchLink.icon, 'navbar-list-option-icon')} />
        <span className='navbar-list-option-text'>{query}</span>
        <span className='navbar-list-option-suffix'>
          {translate('Label.sSearchPhraseV2', {
            location: translate(avatarSearchLink.label)
          })}
        </span>
      </Link>
    </li>
  );
}

AvatarAutocompleteSearchLink.propTypes = {
  translate: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  suggestion: PropTypes.shape({
    Query: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export function SearchLink({ translate, selected, searchInput, suggestion, onClick }) {
  const { url, label, icon } = suggestion;
  const { isRedirectLibraryToCreatorMarketplaceEnabled } = searchConstants;
  const flaggedUrl =
    isRedirectLibraryToCreatorMarketplaceEnabled() && label === 'Label.CreatorMarketplace'
      ? creatorMarketplaceUrl
      : url;

  const listClass = ClassNames('navbar-search-option rbx-clickable-li', {
    'new-selected': selected
  });
  return (
    <li className={listClass}>
      <Link
        className='new-navbar-search-anchor'
        url={flaggedUrl + encodeURIComponent(searchInput)}
        onClick={onClick}>
        <span className={ClassNames(icon, 'navbar-list-option-icon')} />
        <span className='navbar-list-option-text'>{searchInput.toLowerCase()}</span>
        <span className='navbar-list-option-suffix'>
          {translate('Label.sSearchPhraseV2', {
            location: translate(label)
          })}
        </span>
      </Link>
    </li>
  );
}

SearchLink.propTypes = {
  translate: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  searchInput: PropTypes.string.isRequired,
  suggestion: PropTypes.shape({
    url: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    pageSort: PropTypes.arrayOf(PropTypes.string).isRequired,
    icon: PropTypes.string.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};
