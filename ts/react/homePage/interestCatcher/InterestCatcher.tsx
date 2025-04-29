import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import { TranslateFunction } from 'react-utilities';
import { TOmniRecommendationGameSort } from '../../common/types/bedev2Types';
import InterestCatcherGameGrid from './InterestCatcherGameGrid';
import { FeaturePlacesList } from '../../common/constants/translationConstants';
import '../../../../css/homePage/_interestCatcher.scss';
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
  TInterestCatcherButton,
  TInterestCatcherClick
} from '../../common/constants/eventStreamConstants';
import { usePageSession } from '../../common/utils/PageSessionContext';
import { PageContext } from '../../common/types/pageContext';

type TInterestCatcherProps = {
  sort: TOmniRecommendationGameSort;
  itemsPerRow: number | undefined;
  fetchRecommendations: (interestedUniverses?: number[]) => void;
  translate: TranslateFunction;
};

const InterestCatcher = ({
  sort,
  itemsPerRow,
  fetchRecommendations,
  translate
}: TInterestCatcherProps): JSX.Element => {
  const [interestedUniverses, setInterestedUniverses] = useState<Set<number>>(new Set<number>());

  const homePageSessionInfo = usePageSession();

  const buildHeaderButtonClickEventProperties = useCallback(
    (buttonName: TInterestCatcherButton): TInterestCatcherClick => {
      return {
        [EventStreamMetadata.ButtonName]: buttonName,
        [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
        [EventStreamMetadata.InterestedUniverseIds]: Array.from(interestedUniverses),
        [EventStreamMetadata.Page]: PageContext.InterestCatcher
      };
    },
    [homePageSessionInfo, interestedUniverses]
  );

  const sendHeaderButtonClickEvent = useCallback(
    (buttonName: TInterestCatcherButton) => {
      const eventProperties = buildHeaderButtonClickEventProperties(buttonName);
      const eventParams = eventStreamConstants.interestCatcherClick(eventProperties);
      if (eventParams !== undefined) {
        eventStreamService.sendEvent(...eventParams);
      }
    },
    [buildHeaderButtonClickEventProperties]
  );

  const handleSkipClick = useCallback(() => {
    fetchRecommendations([]);
    sendHeaderButtonClickEvent(TInterestCatcherButton.Skip);
  }, [fetchRecommendations, sendHeaderButtonClickEvent]);

  const handleSubmitClick = useCallback(() => {
    fetchRecommendations(Array.from(interestedUniverses));
    sendHeaderButtonClickEvent(TInterestCatcherButton.Continue);
  }, [interestedUniverses, fetchRecommendations, sendHeaderButtonClickEvent]);

  const toggleInterest = (universeId: number) => {
    setInterestedUniverses(prevInterestedUniverses => {
      const newSet = new Set(prevInterestedUniverses);
      if (newSet.has(universeId)) {
        newSet.delete(universeId);
      } else {
        newSet.add(universeId);
      }
      return newSet;
    });
  };

  const continueButtonText = useMemo(() => {
    if (interestedUniverses?.size) {
      return translate(FeaturePlacesList.ActionInterestCatcherContinueSelected, {
        numSelected: interestedUniverses.size
      });
    }

    return translate(FeaturePlacesList.ActionInterestCatcherContinue);
  }, [interestedUniverses, translate]);

  const interestCatcherRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && node.getBoundingClientRect()?.top !== undefined) {
      // Scroll the user to the start of the interest catcher, offset by the nav bar height
      const navBar = document.getElementById('header');

      if (navBar && navBar.getBoundingClientRect()?.height) {
        const navBarOffsetHeight = navBar.getBoundingClientRect().height;

        window.scrollTo({
          top: node.getBoundingClientRect().top + window.scrollY - navBarOffsetHeight
        });
      }
    }
  }, []);

  return (
    <div
      ref={interestCatcherRef}
      className='interest-catcher-container'
      data-testid='interest-catcher-container'>
      <div className='header-container'>
        <div className='header-text-container'>
          <h1 className='header-text'>{sort.topic}</h1>
          <span className='header-subtext'>{sort.subtitle}</span>
        </div>
        <div className='header-buttons-container'>
          {!interestedUniverses?.size && (
            <Button
              variant={Button.variants.secondary}
              size={Button.sizes.medium}
              title={translate(FeaturePlacesList.ActionInterestCatcherSkip)}
              onClick={handleSkipClick}
              className='skip-button'>
              {translate(FeaturePlacesList.ActionInterestCatcherSkip)}
            </Button>
          )}
          <Button
            variant={Button.variants.primary}
            size={Button.sizes.medium}
            title={continueButtonText}
            onClick={handleSubmitClick}
            isDisabled={!interestedUniverses?.size}
            className='continue-button'>
            {continueButtonText}
          </Button>
        </div>
      </div>
      <InterestCatcherGameGrid
        sort={sort}
        itemsPerRow={itemsPerRow}
        translate={translate}
        toggleInterest={toggleInterest}
        interestedUniverses={interestedUniverses}
        homePageSessionInfo={homePageSessionInfo}
      />
    </div>
  );
};

export default InterestCatcher;
