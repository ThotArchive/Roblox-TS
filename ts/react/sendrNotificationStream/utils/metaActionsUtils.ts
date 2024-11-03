import {
  PageState,
  VisualItemMetaAction,
  Action,
  ActionType
} from '../types/NotificationTemplateTypes';

const flattenAllMetaActions = (metaActions: VisualItemMetaAction[]): Action[] => {
  const actions = metaActions.reduce((actionsList, currentMetaAction) => {
    return currentMetaAction.actions.length
      ? [...actionsList, ...currentMetaAction.actions]
      : actionsList;
  }, [] as Action[]);
  return actions;
};

const getIdempotenceKeyFromState = (currentState: PageState | undefined): string => {
  if (currentState && currentState.visualItems.metaAction?.length) {
    const allAction = flattenAllMetaActions(currentState.visualItems.metaAction);
    const abuseReportAction = allAction.find(
      action => action.actionType === ActionType.ReportNotification
    );
    if (abuseReportAction) {
      return abuseReportAction.path ?? '';
    }
  }
  return '';
};

export { flattenAllMetaActions, getIdempotenceKeyFromState };
