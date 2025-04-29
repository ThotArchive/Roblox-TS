import logSduiError, { SduiErrorNames } from '../utils/logSduiError';
import reportActionAnalytics from './reportActionAnalytics';
import SduiActionHandlerRegistry, { TSduiActionConfig } from './SduiActionHandlerRegistry';
import { TAnalyticsContext, TSduiContext } from './SduiTypes';

export const executeAction = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext
): void => {
  const handler = SduiActionHandlerRegistry[actionConfig.actionType];

  const { logAction } = analyticsContext;

  if (logAction) {
    logAction(actionConfig, analyticsContext);
  } else {
    // Use default logAction if logAction from context is missing
    reportActionAnalytics(actionConfig, analyticsContext, null);
  }

  if (handler) {
    handler(actionConfig, analyticsContext, sduiContext);
  } else {
    logSduiError(
      SduiErrorNames.ExecuteActionInvalidActionType,
      `Invalid action type ${actionConfig.actionType} to execute action. No handler found.`
    );
  }
};

export default executeAction;
