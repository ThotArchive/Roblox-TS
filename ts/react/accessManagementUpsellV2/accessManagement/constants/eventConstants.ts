import { eventStreamService } from 'core-roblox-utilities';

export const EventConstants = {
  state: {
    U13To18: 'U13To18',
    U13To1318: 'U13To1318',
    U13ToU13: 'U13ToU13'
  },
  text: {
    IdvOrVpc: 'Verify Your Age/Parent Permission Needed',
    VPC: 'Parent Permission Needed',
    AskYourParent: 'Ask Your Parent',
    VerifyId: 'Verify ID',
    EmailMyParent: 'Email My Parent',
    AskNow: 'Ask Now',
    Cancel: 'X icon or "Cancel"'
  },
  btn: {
    VerifyId: 'verifyId',
    EmailParent: 'emailParent',
    verifyCancel: 'verifyCancel'
  },
  context: {
    SettingsAgeChangeVerify: 'settingsAgeChangeVerify',
    UpdateSetting: 'parentalEntrySettings'
  },
  eventName: {
    AuthPageload: 'authPageload',
    AuthButtonClick: 'authButtonClick'
  }
};
const generateState = (extraState?: string, settingName?: string) => {
  const extraStateString = extraState ? `${extraState}, ` : '';
  const settingNameString = settingName ? `settingName: ${settingName}, ` : '';
  return `${extraStateString}${settingNameString}`;
};

export function sendVerifyIdClickEvent(featureName: string, idvOnly: boolean): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.VerifyId,
        state: idvOnly ? EventConstants.state.U13To18 : EventConstants.state.U13To1318,
        associatedText: EventConstants.text.VerifyId
      }
    );
  }
}

export function sendEmailParentClickEvent(
  featureName: string,
  vpcOnly: boolean,
  settingName?: string,
  recourseParameters?: Record<string, string>
): void {
  if (featureName === 'CanCorrectAge') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.EmailParent,
        state: vpcOnly ? EventConstants.state.U13ToU13 : EventConstants.state.U13To1318,
        associatedText: EventConstants.text.EmailMyParent
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.EmailMyParent
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.AskNow
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.EmailParent,
        state: `unblockExperience ${recourseParameters?.universeId}`,
        associatedText: EventConstants.text.AskNow
      }
    );
  }
}

function getEventStateForCanCorrectAge(prologue: string) {
  let currentState;
  switch (prologue) {
    case 'Idv':
      currentState = EventConstants.state.U13To18;
      break;
    case 'Vpc':
      currentState = EventConstants.state.U13ToU13;
      break;
    case 'IdvOrVpc':
      currentState = EventConstants.state.U13To1318;
      break;
    default:
      break;
  }
  return currentState;
}

export function sendVerifyCancelClickEvent(
  featureName: string,
  prologue: string,
  settingName?: string,
  recourseParameters?: Record<string, string>
): void {
  if (featureName === 'CanCorrectAge') {
    const currentState = getEventStateForCanCorrectAge(prologue);

    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        btn: EventConstants.btn.verifyCancel,
        state: currentState,
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.Cancel
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthButtonClick,
      EventConstants.context.UpdateSetting,
      {
        btn: EventConstants.btn.verifyCancel,
        state: `unblockExperience ${recourseParameters?.universeId}`,
        associatedText: EventConstants.text.Cancel
      }
    );
  }
}

export function sendInitialUpsellPageLoadEvent(
  featureName: string,
  prologue: string,
  settingName?: string,
  recourseParameters?: Record<string, string>
): void {
  if (featureName === 'CanCorrectAge') {
    const currentState = getEventStateForCanCorrectAge(prologue);

    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.SettingsAgeChangeVerify,
      {
        state: currentState,
        associatedText: EventConstants.text.IdvOrVpc
      }
    );
  } else if (featureName === 'CanChangeSetting') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: generateState(undefined, settingName),
        associatedText: EventConstants.text.VPC
      }
    );
  } else if (featureName === 'CanRemoveParentManagedUserBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: `unblockUser ${recourseParameters?.friendUserId}`,
        associatedText: EventConstants.text.AskYourParent
      }
    );
  } else if (featureName === 'CanRemoveParentManagedExperienceBlocks') {
    eventStreamService.sendEventWithTarget(
      EventConstants.eventName.AuthPageload,
      EventConstants.context.UpdateSetting,
      {
        state: `unblockExperience ${recourseParameters?.experienceId}`,
        associatedText: EventConstants.text.AskYourParent
      }
    );
  }
}
