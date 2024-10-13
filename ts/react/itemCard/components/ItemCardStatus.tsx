import React from 'react';
import { TranslateFunction } from 'react-utilities';
import itemCardUtils, { TItemStatus } from '../utils/itemCardUtils';

export type TItemCardStatusProps = {
  itemStatus: Array<string> | undefined;
  translate: TranslateFunction;
};

export function ItemCardStatus({ itemStatus, translate }: TItemCardStatusProps): JSX.Element {
  const itemStatusLabels = itemCardUtils.mapItemStatusIconsAndLabels(itemStatus);
  return (
    <React.Fragment>
      {itemStatus !== undefined && itemStatus.length > 0 && (
        <div className=' item-cards-stackable'>
          <div className='asset-status-icon'>
            {itemStatusLabels.map((status: TItemStatus) => {
              return (
                <div
                  className={`${status.isIcon ? 'has-icon' : ''} ${status.class}`}
                  key={status.type}>
                  {status.isIcon && <span className={status.type} />}
                  {!!status.label && <span>{translate(status.label)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
export default ItemCardStatus;
