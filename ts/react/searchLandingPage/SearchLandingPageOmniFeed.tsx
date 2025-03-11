import { withTranslations, WithTranslationsProps } from 'react-utilities';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fireEvent } from 'roblox-event-tracker';
import bedev2Services from '../common/services/bedev2Services';
import { translationConfig } from './app.config';
import { mapExploreApiSortsResponse } from '../omniFeed/utils/gameSortUtils';
import { TExploreApiSorts, TTreatmentType } from '../common/types/bedev2Types';
import {
  ModalEvent,
  UpdateSearchSessionInfoEventParams,
  ShowSearchLandingEventParams
} from './service/modalConstants';
import { LoadingGameTile } from '../common/components/LoadingGameTile';
import SearchLandingPageSessionContext from './SearchLandingPageSessionContext';
import { searchLandingPage } from '../common/constants/configConstants';
import OmniFeedItem from '../omniFeed/OmniFeedItem';
import { PageContext } from '../common/types/pageContext';

function SearchLandingPageOmniFeed({ translate }: WithTranslationsProps): JSX.Element | null {
  const [showSearchLanding, setShowSearchLanding] = useState<boolean>(false);
  const [sessionInfo, setSesssionInfo] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<TExploreApiSorts | undefined>(undefined);

  useEffect(() => {
    const isValidUpdateSessionInfoEvent = (
      event: Event
    ): event is CustomEvent<UpdateSearchSessionInfoEventParams> => {
      return event instanceof CustomEvent && event.type === ModalEvent.UpdateSearchSessionInfo;
    };
    const onUpdateSessionInfo = (event: Event) => {
      if (isValidUpdateSessionInfoEvent(event)) {
        const { sessionInfo: updatedSessionInfo } = event.detail;
        setSesssionInfo(updatedSessionInfo);
      }
    };

    const isValidShowSlpEvent = (
      event: Event
    ): event is CustomEvent<ShowSearchLandingEventParams> => {
      return event instanceof CustomEvent && event.type === ModalEvent.ShowSearchLanding;
    };
    const onShowSearchLanding = (event: Event) => {
      if (isValidShowSlpEvent(event)) {
        const { sessionInfo: updatedSessionInfo } = event.detail;
        setSesssionInfo(updatedSessionInfo);
        setShowSearchLanding(true);
      }
    };

    window.addEventListener(ModalEvent.UpdateSearchSessionInfo, onUpdateSessionInfo);
    window.addEventListener(ModalEvent.ShowSearchLanding, onShowSearchLanding);
    return () => {
      window.removeEventListener(ModalEvent.UpdateSearchSessionInfo, onUpdateSessionInfo);
      window.removeEventListener(ModalEvent.ShowSearchLanding, onShowSearchLanding);
    };
  }, []);

  const fetchLandingRecommendations = useCallback(() => {
    if (!sessionInfo) {
      fireEvent(searchLandingPage.searchLandingPageMissingSessionInfoError);
      return;
    }
    setIsLoading(true);
    bedev2Services
      .getSearchLandingRecommendations(sessionInfo)
      .then(data => {
        fireEvent(searchLandingPage.searchLandingPageFetchRecommendationsSuccess);
        const recs = mapExploreApiSortsResponse(data);
        recs.sorts.forEach(sort => {
          if (sort.treatmentType !== TTreatmentType.Carousel) {
            fireEvent(searchLandingPage.searchLandingPageUnexpectedTreatmentTypeError);
          }
        });
        setRecommendations(recs);
      })
      .catch(() => {
        fireEvent(searchLandingPage.searchLandingPageFetchRecommendationsError);
        setRecommendations(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [sessionInfo]);

  useEffect(() => {
    if (!showSearchLanding) return;
    fetchLandingRecommendations();
  }, [fetchLandingRecommendations, showSearchLanding]);

  // Needed for users who have no experiences in the recently visited section
  const hasRecommendations = useMemo(
    () =>
      recommendations?.sorts.some(
        sort => sort.treatmentType === TTreatmentType.Carousel && sort.games.length > 0
      ) ?? false,
    [recommendations]
  );

  // If the SLP is disabled or the recommendations are empty, don't render the SLP
  if (!showSearchLanding || (!isLoading && !hasRecommendations)) return null;

  // If the SLP is loading, show the loading state
  if (isLoading || !recommendations) {
    return (
      <div className='search-landing-container' data-testid='SearchLandingPageOmniFeedTestId'>
        <div className='search-landing-loading-title shimmer' />
        <div className='search-landing-loading-carousel'>
          {Array.from({ length: searchLandingPage.numberOfTilesPerCarousel }, (_, id) => (
            <LoadingGameTile key={id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <SearchLandingPageSessionContext.Provider value={sessionInfo}>
      <section
        data-testid='SearchLandingPageOmniFeedTestId'
        className='search-landing-container'
        role='presentation'
        onMouseDown={e => {
          // Prevent onBlur from SearchInput component from hiding the search landing
          // if the click occurs within the search landing UI
          e.preventDefault();
        }}>
        {recommendations.sorts.map((sort, positionId) => (
          <OmniFeedItem
            // eslint-disable-next-line react/no-array-index-key
            key={positionId}
            translate={translate}
            sort={sort}
            positionId={positionId}
            // TODO CLIGROW-2277 write hook to get the starting row
            startingRow={undefined}
            currentPage={PageContext.SearchLandingPage}
            itemsPerRow={searchLandingPage.numberOfTilesPerCarousel}
            isCarouselHorizontalScrollEnabled
          />
        ))}
      </section>
    </SearchLandingPageSessionContext.Provider>
  );
}

export default withTranslations(SearchLandingPageOmniFeed, translationConfig);
