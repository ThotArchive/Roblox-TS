import { ActionType, InteractibleVisualItem } from '../types/NotificationTemplateTypes';

export default (visualItem: InteractibleVisualItem): boolean => {
  if (visualItem.actions) {
    return visualItem.actions.some(action => action.actionType === ActionType.ReportNotification);
  }
  return false;
};
