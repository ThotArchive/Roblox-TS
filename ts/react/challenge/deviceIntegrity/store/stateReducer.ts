import { DeviceIntegrityAction, DeviceIntegrityActionType } from './action';
import { DeviceIntegrityState } from './state';

const deviceIntegrityStateReducer = (
  oldState: DeviceIntegrityState,
  action: DeviceIntegrityAction
): DeviceIntegrityState => {
  const newState = { ...oldState };
  switch (action.type) {
    case DeviceIntegrityActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case DeviceIntegrityActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    default:
      return oldState;
  }
};

export default deviceIntegrityStateReducer;
