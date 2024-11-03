import { eventStreamService } from 'core-roblox-utilities';
import { AccessManagementUpsellEvent } from '../utils/loggingUtils';

const { eventTypes } = eventStreamService;
const ACCESS_MANAGEMENT_UPSELL = 'accessManagementUpsell';

export const ShowModalEvent: AccessManagementUpsellEvent = {
  name: 'showModal',
  type: eventTypes.modalAction,
  context: ACCESS_MANAGEMENT_UPSELL,
  params: {
    aType: 'shown'
  }
};

export const AccountSettingsClickEvent: AccessManagementUpsellEvent = {
  name: 'accountSettingsClick',
  type: eventTypes.buttonClick,
  context: ACCESS_MANAGEMENT_UPSELL,
  params: {
    btn: 'accountInfo'
  }
};
