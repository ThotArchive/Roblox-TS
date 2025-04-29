import { EventStream } from 'Roblox';
import { EventContext, EVENT_NAME, EVENT_PLATFORM } from './eventConstants';

const sendReminderOfNormsEvent = (
  interventionId: string,
  interactionType: string,
  reminderNumber: number,
  userId: string,
  timestamp: number,
  timeToInteraction: number,
  experimentVariant: string
): void => {
  EventStream.SendEventWithTarget(
    EVENT_NAME,
    EventContext,
    // additionalProperties
    {
      user_id: userId,
      source_intervention_id: interventionId,
      reminder_number: reminderNumber,
      timestamp_milliseconds: timestamp,
      time_to_interact_seconds: timeToInteraction,
      interaction: interactionType,
      platform: EVENT_PLATFORM,
      experiment_variant: experimentVariant
    },
    EventStream.TargetTypes.WWW
  );
};

export default sendReminderOfNormsEvent;
