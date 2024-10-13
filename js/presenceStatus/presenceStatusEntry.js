import presence from '@rbx/presence';
import { PresenceTypes } from './constants/presenceStatusConstants';
import './services/presenceStatusUpdateService';

// TODO: clean this up.  (SACQ-719)
window.Roblox.Presence = window.Roblox.Presence || {};
window.Roblox.Presence.PresenceTypes = PresenceTypes;

window.RobloxPresence = presence;
