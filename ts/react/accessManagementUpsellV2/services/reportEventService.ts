import { eventStreamService } from 'core-roblox-utilities';
import { ReportEvent, Recourse } from '../enums';

const reportEvent = (
  event: ReportEvent,
  context: Recourse,
  eventParams: Record<string, string>
): void => {
  eventStreamService.sendEventWithTarget(event, context, eventParams);
};

export default reportEvent;
