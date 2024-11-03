import React, { useCallback, useEffect } from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { TFiltersData } from '../../common/types/bedev2Types';
import FilterDropdownOption from './FilterDropdownOption';
import { CommonUIFeatures, FeatureGamePage } from '../../common/constants/translationConstants';
import configConstants from '../../common/constants/configConstants';
import { TGamesFilterButton } from '../../common/constants/eventStreamConstants';
import { TSendFilterClickEvent } from '../../omniFeed/hooks/useGameFiltersAnalytics';

const { common } = configConstants;

type TGamesFilterDropdownProps = {
  filter: TFiltersData;
  dropdownContainerRef: React.RefObject<HTMLDivElement>;
  selectedOptionId: string;
  setSelectedOptionId: (optionId: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  updateFilterValue: (newValue: string) => void;
  sendFilterClickEvent: TSendFilterClickEvent;
  translate: TranslateFunction;
};

/**
 * Custom dropdown component for selecting from a list of filter options.
 * The options each have a circle icon that displays the selected state,
 * and the first option (for "all" options) has a divider below it.
 */
const GamesFilterDropdown = ({
  filter,
  dropdownContainerRef,
  selectedOptionId,
  setSelectedOptionId,
  setIsDropdownOpen,
  updateFilterValue,
  sendFilterClickEvent,
  translate
}: TGamesFilterDropdownProps): JSX.Element => {
  const handleApplyClick = useCallback(() => {
    updateFilterValue(selectedOptionId);
    setIsDropdownOpen(false);

    sendFilterClickEvent(
      filter.filterId,
      TGamesFilterButton.Apply,
      selectedOptionId,
      filter.selectedOptionId
    );
  }, [
    selectedOptionId,
    updateFilterValue,
    setIsDropdownOpen,
    filter.filterId,
    filter.selectedOptionId,
    sendFilterClickEvent
  ]);

  const closeAndResetDropdown = useCallback(() => {
    const selectedOptionIdBeforeClose = selectedOptionId;

    setIsDropdownOpen(false);
    setSelectedOptionId(filter.selectedOptionId);

    sendFilterClickEvent(
      filter.filterId,
      TGamesFilterButton.CloseDropdown,
      filter.selectedOptionId,
      selectedOptionIdBeforeClose
    );
  }, [
    filter.selectedOptionId,
    setIsDropdownOpen,
    sendFilterClickEvent,
    filter.filterId,
    setSelectedOptionId,
    selectedOptionId
  ]);

  const handleMouseClick = useCallback(
    (e: MouseEvent) => {
      // If the click is outside the dropdown container, close and reset the dropdown
      // note: the dropdown container includes the dropdown entry button
      if (
        dropdownContainerRef.current &&
        e.target instanceof Node &&
        !dropdownContainerRef.current.contains(e.target)
      ) {
        closeAndResetDropdown();
      }
    },
    [closeAndResetDropdown, dropdownContainerRef]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === common.keyBoardEventCode.escape) {
        closeAndResetDropdown();
      }
    },
    [closeAndResetDropdown]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseClick, handleKeyDown]);

  return (
    <div className='filters-modal-container'>
      <div className='header-container'>
        <h3>{filter.filterDisplayName}</h3>
        <div>
          <button
            type='button'
            className='header-close-button'
            onClick={() => closeAndResetDropdown()}
            aria-label={translate(CommonUIFeatures.ActionClose)}>
            <span className='icon-close' />
          </button>
        </div>
      </div>
      <div className='filter-options-container'>
        {filter.filterOptions.map((option, index) => {
          return (
            <React.Fragment key={option.optionId}>
              <FilterDropdownOption
                option={option}
                isSelected={selectedOptionId === option.optionId}
                setSelectedOptionId={setSelectedOptionId}
                translate={translate}
              />
              {index === 0 && <div className='filter-option-divider' />}
            </React.Fragment>
          );
        })}
      </div>
      <div className='action-buttons-container'>
        <Button
          onClick={handleApplyClick}
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          width={Button.widths.full}
          className='apply-button'
          isDisabled={selectedOptionId === filter.selectedOptionId}>
          {translate(FeatureGamePage.ActionApply) || 'Apply'}
        </Button>
      </div>
    </div>
  );
};

export default GamesFilterDropdown;
