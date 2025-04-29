import React from 'react';
import { useHistory } from 'react-router';
import { reauthenticationTypeToPath } from '../hooks/useActiveReauthenticationType';
import { ReauthenticationType } from '../interface';

type ReauthListItemProps = {
  rowLabel: string;
  rowIcon: string;
  requestInFlight: boolean;
  typeToBeSelected: ReauthenticationType;
};

/**
 * A component that displays a list item for reauth methods. We should probably consolidate
 * this with what's in 2SV, but that'll require some parameterization in 2SV first.
 */
const ReauthListItem: React.FC<ReauthListItemProps> = ({
  rowLabel,
  rowIcon,
  requestInFlight,
  typeToBeSelected
}) => {
  const history = useHistory();

  return (
    <tr
      onClick={
        requestInFlight
          ? undefined
          : () => history.push(reauthenticationTypeToPath(typeToBeSelected))
      }
      className={requestInFlight ? 'media-type-row disabled' : 'media-type-row'}>
      <td>
        <span className={rowIcon} />
      </td>
      <td className='media-type-label'>{rowLabel}</td>
      <td className='media-type-selector'>
        <span className='icon-next' />
        <div className='icon-placeholder' />
      </td>
    </tr>
  );
};

export { ReauthListItem, ReauthListItemProps };
