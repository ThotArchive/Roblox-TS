import openGameDetails from './actions/openGameDetails';
import { TAnalyticsContext } from './SduiTypes';

export enum SduiActionType {
  OpenGameDetails = 'OpenGameDetails',
  PlayButtonClick = 'PlayButtonClick'
}

export type TSduiActionConfig = {
  actionType: SduiActionType;
  actionParams: Record<string, unknown>;
};

type TSduiActionHandler = (
  actionConfig?: TSduiActionConfig,
  analyticsContext?: TAnalyticsContext
) => void;

export const SduiActionHandlerRegistry: Record<keyof typeof SduiActionType, TSduiActionHandler> = {
  [SduiActionType.OpenGameDetails]: openGameDetails,
  // No handler is needed since the PlayButton component handles the actual game launch
  [SduiActionType.PlayButtonClick]: () => undefined
};

export default SduiActionHandlerRegistry;
