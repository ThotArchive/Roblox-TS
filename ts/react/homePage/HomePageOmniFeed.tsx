import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { dataStores } from 'core-roblox-utilities';
import { fireEvent } from 'roblox-event-tracker';
import bedev2Services from '../common/services/bedev2Services';
import ErrorStatus from '../common/components/ErrorStatus';
import OmniFeedItem from '../omniFeed/OmniFeedItem';
import { homePage } from '../common/constants/configConstants';
import { LoadingGameTile } from '../common/components/LoadingGameTile';
import { CommonGameSorts } from '../common/constants/translationConstants';
import { TPageType } from '../common/types/bedev1Types';
import {
  TContentType,
  TGetOmniRecommendationsResponse,
  TOmniRecommendationsContentMetadata,
  TTreatmentType
} from '../common/types/bedev2Types';
import { ContentMetadataContext } from '../omniFeed/utils/contentMetadataContextProvider';
import useApportionGridRecommendationsWithResize from '../omniFeed/hooks/useApportionGridRecommendationsWithResize';
import { PageContext } from '../common/types/pageContext';
import { useVerticalScrollTracker } from '../common/components/useVerticalScrollTracker';
import { usePageSession, withPageSession } from '../common/utils/PageSessionContext';
import personalizationTranslationConfig from './translation.config';
import getDeviceFeatures from '../common/utils/deviceFeaturesUtils';
import experimentConstants from '../common/constants/experimentConstants';
import HomePageUpsellCardContainerEntry from '../../../js/react/homePageUpsellCard/App';
import InterestCatcher from './interestCatcher/InterestCatcher';
import { isGameSortFromOmniRecommendations } from '../omniFeed/utils/gameSortUtils';
import FriendsCarousel from './FriendsCarousel';

const { maxTilesPerCarouselPage } = homePage;

const { layerNames, defaultValues } = experimentConstants;

export const HomePageOmniFeed = ({ translate }: WithTranslationsProps): JSX.Element => {
  const homePageSessionInfo = usePageSession();
  const [recommendations, setRecommendations] = useState<
    TGetOmniRecommendationsResponse | undefined
  >(undefined);
  const [error, setError] = useState<boolean>(false);

  const deviceFeatures = useMemo(() => {
    return getDeviceFeatures();
  }, []);

  const authIntentFeatures = useMemo(() => {
    try {
      const {
        authIntentDataStore: { retrieveAuthIntentDataForUser }
      } = dataStores;
      return retrieveAuthIntentDataForUser();
    } catch (e) {
      console.error('Error retrieving auth intent data:', e);
      return undefined;
    }
  }, []);

  const fetchRecommendations = useCallback(
    (interestedUniverses?: number[]) => {
      setRecommendations(undefined);
      setError(false);
      bedev2Services
        .getOmniRecommendations(
          TPageType.Home,
          homePageSessionInfo,
          deviceFeatures,
          authIntentFeatures,
          interestedUniverses
        )
        .then(data => {
          setRecommendations(data);
          fireEvent(homePage.omniRecommendationEndpointSuccessEvent);
        })
        .catch(() => {
          setError(true);
          fireEvent(homePage.omniRecommendationEndpointErrorEvent);
        });
    },
    [homePageSessionInfo, deviceFeatures, authIntentFeatures]
  );

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const [experimentationValues, setExperimentationValues] = useState<
    typeof defaultValues.homePageWeb | undefined
  >(undefined);

  useEffect(() => {
    bedev2Services
      .getExperimentationValues(layerNames.homePageWeb, defaultValues.homePageWeb)
      .then(data => {
        setExperimentationValues(data);
      })
      .catch(() => {
        setExperimentationValues(defaultValues.homePageWeb);
      });
  }, []);

  const isExpandHomeContentEnabled = experimentationValues?.IsExpandHomeContentEnabled;

  const isCarouselHorizontalScrollEnabled =
    experimentationValues?.IsCarouselHorizontalScrollEnabled;

  const isNewScrollArrowsEnabled = experimentationValues?.IsNewScrollArrowsEnabled;

  const appendContentMetadata = useCallback(
    (additionalMetadata: TOmniRecommendationsContentMetadata) => {
      setRecommendations(prevRecommendations => {
        if (prevRecommendations) {
          return {
            ...prevRecommendations,
            contentMetadata: {
              [TContentType.Game]: {
                ...prevRecommendations.contentMetadata[TContentType.Game],
                ...additionalMetadata[TContentType.Game]
              },
              [TContentType.CatalogAsset]: {
                ...prevRecommendations.contentMetadata[TContentType.CatalogAsset],
                ...additionalMetadata[TContentType.CatalogAsset]
              },
              [TContentType.CatalogBundle]: {
                ...prevRecommendations.contentMetadata[TContentType.CatalogBundle],
                ...additionalMetadata[TContentType.CatalogBundle]
              }
            }
          };
        }
        return prevRecommendations;
      });
    },
    []
  );

  const {
    homeFeedRef,
    gridRecommendationsMap,
    itemsPerRowMap,
    startingRowNumbersMap
  } = useApportionGridRecommendationsWithResize(
    recommendations,
    isExpandHomeContentEnabled,
    isCarouselHorizontalScrollEnabled
  );

  useVerticalScrollTracker(PageContext.HomePage);

  const shouldShowLocalFriendsCarousel = useMemo((): boolean => {
    // During migration, show local friends carousel if server does not send one
    if (recommendations?.sorts) {
      return recommendations.sorts.every(
        sort => sort.treatmentType !== TTreatmentType.FriendCarousel
      );
    }
    return false;
  }, [recommendations?.sorts]);

  const interestCatcherSortIndex: number | undefined = useMemo(() => {
    return recommendations?.sorts.findIndex(
      sort => sort.treatmentType === TTreatmentType.InterestGrid
    );
  }, [recommendations?.sorts]);

  if (error) {
    return (
      <div className='game-home-page-container' data-testid='HomePageContainerTestId'>
        <h2>{translate(CommonGameSorts.LabelGames)}</h2>
        <ErrorStatus
          errorMessage={translate(CommonGameSorts.LabelApiError)}
          onRefresh={() => fetchRecommendations()}
        />
      </div>
    );
  }

  if (recommendations === undefined) {
    return (
      <div className='game-home-page-container' data-testid='HomePageContainerTestId'>
        <div className='game-home-page-loading-title shimmer' />
        <div className='game-home-page-loading-carousel'>
          {Array.from({ length: maxTilesPerCarouselPage }, (_, id) => (
            <LoadingGameTile key={id} />
          ))}
        </div>
      </div>
    );
  }

  if (interestCatcherSortIndex !== undefined && interestCatcherSortIndex > -1) {
    const interestCatcherSort = recommendations.sorts[interestCatcherSortIndex];
    if (interestCatcherSort && isGameSortFromOmniRecommendations(interestCatcherSort)) {
      return (
        <div className='game-home-page-container' data-testid='HomePageContainerTestId'>
          <div ref={homeFeedRef}>
            <ContentMetadataContext.Provider
              value={{
                contentMetadata: recommendations.contentMetadata,
                appendContentMetadata
              }}>
              <InterestCatcher
                sort={interestCatcherSort}
                itemsPerRow={itemsPerRowMap.get(interestCatcherSortIndex)}
                fetchRecommendations={fetchRecommendations}
                translate={translate}
              />
            </ContentMetadataContext.Provider>
          </div>
        </div>
      );
    }
  }

  return (
    <div className='game-home-page-container' data-testid='HomePageContainerTestId'>
      <div ref={homeFeedRef}>
        <ContentMetadataContext.Provider
          value={{
            contentMetadata: recommendations.contentMetadata,
            appendContentMetadata
          }}>
          <HomePageUpsellCardContainerEntry translate={translate} context={undefined} />
          {shouldShowLocalFriendsCarousel && (
            <FriendsCarousel
              homePageSessionInfo={homePageSessionInfo}
              sortId={undefined}
              sortPosition={0}
            />
          )}
          {recommendations.sorts.map((sort, positionId) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={positionId}>
              <OmniFeedItem
                translate={translate}
                sort={sort}
                positionId={positionId}
                startingRow={startingRowNumbersMap.get(positionId)}
                currentPage={PageContext.HomePage}
                itemsPerRow={itemsPerRowMap.get(positionId)}
                gridRecommendations={gridRecommendationsMap.get(positionId) ?? []}
                isExpandHomeContentEnabled={isExpandHomeContentEnabled}
                isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
                isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
                sduiRoot={recommendations.sdui}
              />
            </React.Fragment>
          ))}
        </ContentMetadataContext.Provider>
      </div>
    </div>
  );
};

export default withPageSession(
  withTranslations(HomePageOmniFeed, personalizationTranslationConfig)
);
