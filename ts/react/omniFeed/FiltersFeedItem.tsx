import React, { useRef } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TExploreApiFiltersSort } from '../common/types/bedev2Types';
import GamesFilter from '../gamesPage/components/GamesFilter';
import { extractFiltersFromExploreSorts } from './utils/gameSortUtils';
import useGameFiltersAnalytics from './hooks/useGameFiltersAnalytics';

type TFiltersFeedItemProps = {
  sort: TExploreApiFiltersSort;
  positionId: number;
  translate: TranslateFunction;
  fetchGamesPageData?: (filters: Map<string, string>) => void;
};

const FiltersFeedItem = ({
  sort,
  positionId,
  translate,
  fetchGamesPageData
}: TFiltersFeedItemProps): JSX.Element => {
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  const sendFilterClickEvent = useGameFiltersAnalytics(sort, positionId, filtersContainerRef);

  const handleFilterChange = (filterType: string, newValue: string) => {
    const filters = extractFiltersFromExploreSorts([sort]);

    if (fetchGamesPageData && filters) {
      filters.set(filterType, newValue);

      fetchGamesPageData(filters);
    }
  };

  return (
    <div ref={filtersContainerRef} className='filters-container'>
      <div className='filters-header-container'>
        <span className='filters-header'>{sort.topic}</span>
      </div>
      <div className='filter-items-container'>
        {sort.filters.map(filter => (
          <GamesFilter
            key={filter.filterId}
            filter={filter}
            updateFilterValue={(newValue: string) =>
              handleFilterChange(filter.filterType, newValue)
            }
            sendFilterClickEvent={sendFilterClickEvent}
            translate={translate}
          />
        ))}
      </div>
    </div>
  );
};

FiltersFeedItem.defaultProps = {
  fetchGamesPageData: undefined
};

export default FiltersFeedItem;
