import React, { useMemo, useState } from 'react';
import { Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { TFiltersData } from '../../common/types/bedev2Types';
import GamesFilterDropdown from './GamesFilterDropdown';
import { TGamesFilterButton } from '../../common/constants/eventStreamConstants';
import { TSendFilterClickEvent } from '../../omniFeed/hooks/useGameFiltersAnalytics';

type TGamesFilterProps = {
  filter: TFiltersData;
  updateFilterValue: (newValue: string) => void;
  sendFilterClickEvent: TSendFilterClickEvent;
  translate: TranslateFunction;
};

const GamesFilter = ({
  filter,
  updateFilterValue,
  sendFilterClickEvent,
  translate
}: TGamesFilterProps): JSX.Element => {
  const dropdownContainerRef = React.useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string>(filter.selectedOptionId);

  const filterDisplayText = useMemo(() => {
    const selectedOption = filter.filterOptions.find(
      option => option.optionId === filter.selectedOptionId
    );

    return selectedOption?.optionDisplayName;
  }, [filter.selectedOptionId, filter.filterOptions]);

  const handleDropdownEntryClick = () => {
    setIsDropdownOpen(prevIsDropdownOpen => {
      const clickType = prevIsDropdownOpen
        ? TGamesFilterButton.CloseDropdown
        : TGamesFilterButton.OpenDropdown;

      const previousOptionId = prevIsDropdownOpen ? selectedOptionId : undefined;

      sendFilterClickEvent(filter.filterId, clickType, filter.selectedOptionId, previousOptionId);

      return !prevIsDropdownOpen;
    });
  };

  return (
    <div ref={dropdownContainerRef}>
      <Button
        onClick={() => handleDropdownEntryClick()}
        variant={isDropdownOpen ? Button.variants.primary : Button.variants.secondary}
        size={Button.sizes.medium}
        className='filter-select'>
        <span className='filter-display-text'>{filterDisplayText}</span>
        <span className={isDropdownOpen ? 'icon-expand-arrow-selected' : 'icon-expand-arrow'} />
      </Button>
      {isDropdownOpen && (
        <GamesFilterDropdown
          filter={filter}
          dropdownContainerRef={dropdownContainerRef}
          selectedOptionId={selectedOptionId}
          setSelectedOptionId={setSelectedOptionId}
          setIsDropdownOpen={setIsDropdownOpen}
          updateFilterValue={updateFilterValue}
          sendFilterClickEvent={sendFilterClickEvent}
          translate={translate}
        />
      )}
    </div>
  );
};

export default GamesFilter;
