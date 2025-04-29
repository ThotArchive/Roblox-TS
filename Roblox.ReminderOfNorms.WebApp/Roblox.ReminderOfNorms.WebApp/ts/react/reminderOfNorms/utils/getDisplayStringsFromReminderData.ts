import { ReminderDataType } from './types';

export type ReminderDisplayStringsType = {
  dialogTitle: string;
  dialogBodyAbuseType: string;
  dialogBodyGuidelineReminder: string;
  confirmationButtonLabel: string;
};

function getDisplayStringsFromReminderData(
  reminderData: ReminderDataType,
  translate: (key: string, params?: Record<string, unknown> | undefined) => string
): ReminderDisplayStringsType {
  const { contentVariant, policyViolation } = reminderData;

  let dialogBodyGuidelineReminder = '';
  switch (contentVariant) {
    case 'positive':
      dialogBodyGuidelineReminder = translate('Experiment.Reminders.BodyPositiveVariant');
      break;

    case 'warning':
      dialogBodyGuidelineReminder = translate('Experiment.Reminders.BodyWarningVariant');
      break;
    default:
      break;
  }

  return {
    dialogTitle: translate('Experiment.Reminders.Title'),
    dialogBodyAbuseType: translate('Experiment.Reminders.BodyShared', {
      policy_violation: translate(policyViolation)
    }),
    dialogBodyGuidelineReminder,
    confirmationButtonLabel: translate('Experiment.Reminders.Button')
  };
}

export default getDisplayStringsFromReminderData;
