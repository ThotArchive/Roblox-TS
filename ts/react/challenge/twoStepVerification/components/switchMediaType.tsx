import React from 'react';
import { useHistory } from 'react-router';
import { mediaTypeToPath } from '../hooks/useActiveMediaType';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { ActionType, MediaType } from '../interface';

type Props = {
  requestInFlight: boolean;
  originalMediaType: MediaType;
  actionType: ActionType;
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

/**
 * A button to initiate switching the 2SV media type for the current challenge.
 */
const SwitchMediaType: React.FC<Props> = ({
  requestInFlight,
  originalMediaType,
  actionType,
  className
}: Props) => {
  const {
    state: { renderInline, eventService, resources }
  } = useTwoStepVerificationContext();
  const history = useHistory();

  const clearMediaType = () => {
    eventService.sendTryToSwitchMediaTypeEvent(originalMediaType, actionType);
    history.push(mediaTypeToPath(null));
  };

  const buttonLinkClassName = renderInline
    ? 'inline-challenge-body-button-link'
    : 'modal-body-button-link';

  return (
    <p className={className}>
      <button
        type='button'
        className={`${buttonLinkClassName} small`}
        onClick={clearMediaType}
        disabled={requestInFlight}>
        {resources.Action.ChangeMediaType}
      </button>
    </p>
  );
};

export default SwitchMediaType;
