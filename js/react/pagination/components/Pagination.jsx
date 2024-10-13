import React from 'react';
import PropTypes from 'prop-types';
import TYPES from '../constants/types';
import IconButton from '../../button/components/IconButton';

const FIRST_PAGE = 1;

function PaginationBase({ type, onChange, current, total, hasNext }) {
  const showExtended = type === TYPES.Extended;
  const isFirstPage = current === FIRST_PAGE;
  const isLastPage = current === total || !hasNext;

  const goToFirstPage = () => onChange(FIRST_PAGE);
  const goToPrevPage = () => current > FIRST_PAGE && onChange(current - 1);
  const goToNextPage = () => (current < total || hasNext) && onChange(current + 1);
  const goToLastPage = () => onChange(total);
  const currentPageLabel = total > 1 ? `${current} / ${total}` : current;

  return (
    <div className='pager-holder'>
      <ul className='pager'>
        {showExtended && (
          <li className='first'>
            <IconButton
              iconName='first-page'
              size={IconButton.sizes.small}
              onClick={goToFirstPage}
              isDisabled={isFirstPage}
            />
          </li>
        )}
        <li className='pager-prev'>
          <IconButton
            iconName='left'
            size={IconButton.sizes.small}
            onClick={goToPrevPage}
            isDisabled={isFirstPage}
          />
        </li>
        <li className='pager-cur'>
          <span id='rbx-current-page'>{currentPageLabel}</span>
        </li>
        <li className='pager-next'>
          <IconButton
            iconName='right'
            size={IconButton.sizes.small}
            onClick={goToNextPage}
            isDisabled={isLastPage}
          />
        </li>
        {showExtended && (
          <li className='last'>
            <IconButton
              iconName='last-page'
              size={IconButton.sizes.small}
              onClick={goToLastPage}
              isDisabled={isLastPage}
            />
          </li>
        )}
      </ul>
    </div>
  );
}

PaginationBase.defaultProps = {
  type: TYPES.Basic,
  total: 0,
  hasNext: false
};

PaginationBase.propTypes = {
  type: PropTypes.oneOf(Object.values(TYPES)),
  onChange: PropTypes.func.isRequired,
  current: PropTypes.number.isRequired,
  total: PropTypes.number,
  hasNext: PropTypes.bool
};

PaginationBase.Types = TYPES;

export default PaginationBase;
