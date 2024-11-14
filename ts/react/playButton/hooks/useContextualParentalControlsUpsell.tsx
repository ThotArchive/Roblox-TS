import { useState, useCallback } from 'react';
import { AccessManagementUpsellV2Service, Endpoints } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { TSettingResponse } from '../types/playButtonTypes';
import {
  launchGame,
  startAccessManagementUpsellFlow,
  sendUnlockPlayIntentEvent
} from '../utils/playButtonUtils';
import playButtonConstants, { PlayabilityStatus } from '../constants/playButtonConstants';

const { counterEvents, unlockPlayIntentConstants } = playButtonConstants;

type TContextualParentalControlUpsell = {
  launchPlayButtonUpsell: (
    contentAgeRestriction: TSettingResponse | undefined,
    minimumAge: number | undefined,
    hasError: boolean
  ) => void;
  isSelfUpdateSettingModalOpen: boolean;
  navigateToAccountSettings: () => void;
  closeSelfUpdateSettingModal: () => void;
  isRestrictedUnplayableModalOpen: boolean;
  closeRestrictedUnplayableModal: () => void;
};

/**
 * Returns a callback that should be called when the user clicks the play button.
 * The callback uses the experience's minimumAge and the user's contentAgeRestriction setting
 * to determine which upsell modal to display, and then displays it to the user.
 */
const useContextualParentalControlsUpsell = (
  placeId: string,
  universeId: string,
  rootPlaceId?: string,
  privateServerLinkCode?: string,
  gameInstanceId?: string,
  eventProperties?: Record<string, string | number | undefined>
): TContextualParentalControlUpsell => {
  const [isSelfUpdateSettingModalOpen, setIsSelfUpdateSettingModalOpen] = useState<boolean>(false);

  const [isRestrictedUnplayableModalOpen, setIsRestrictedUnplayableModalOpen] = useState<boolean>(
    false
  );

  const launchGameFallback = useCallback(() => {
    launchGame(
      placeId,
      rootPlaceId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      undefined
    );
  }, [eventProperties, gameInstanceId, placeId, privateServerLinkCode, rootPlaceId]);

  const launchPlayButtonUpsell = useCallback(
    async (
      contentAgeRestriction: TSettingResponse | undefined,
      minimumAge: number | undefined,
      hasError: boolean
    ) => {
      const sendUnlockPlayIntent = (upsellName: string) => {
        sendUnlockPlayIntentEvent(
          universeId,
          upsellName,
          PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls
        );
      };

      if (hasError || contentAgeRestriction === undefined || minimumAge === undefined) {
        launchGameFallback();

        fireEvent(counterEvents.PlayButtonUpsellUnknownSettingOrAge);

        sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
        return;
      }

      const minimumAgeToSettingValue: Record<number, string> = {
        '-1': 'ThirteenPlus',
        9: 'NinePlus',
        13: 'ThirteenPlus',
        17: 'SeventeenPlus',
        18: 'EighteenPlus'
      };

      if (!minimumAgeToSettingValue[minimumAge]) {
        launchGameFallback();

        fireEvent(counterEvents.PlayButtonUpsellAgeNotInMapping);

        sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
        return;
      }

      const requestedSettingValue = minimumAgeToSettingValue[minimumAge];

      const requestedOption = contentAgeRestriction.options.find(
        option => option?.option?.optionValue === requestedSettingValue
      );

      if (requestedOption) {
        const { requirement } = requestedOption;

        switch (requirement) {
          case 'SelfUpdateSetting': {
            setIsSelfUpdateSettingModalOpen(true);

            fireEvent(counterEvents.PlayButtonUpsellSelfUpdateSettingTriggered);

            sendUnlockPlayIntent(requirement);
            break;
          }
          case 'ParentalConsent': {
            try {
              fireEvent(counterEvents.PlayButtonUpsellAskYourParentTriggered);

              sendUnlockPlayIntent(requirement);

              await AccessManagementUpsellV2Service.startAccessManagementUpsell({
                featureName: 'CanChangeSetting',
                isAsyncCall: false,
                usePrologue: true,
                ampRecourseData: {
                  contentAgeRestriction: requestedOption?.option?.optionValue
                }
              });
            } catch {
              launchGameFallback();

              fireEvent(counterEvents.PlayButtonUpsellParentalConsentError);

              sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
            }

            break;
          }
          case 'ContentAgeRestrictionVerification': {
            try {
              fireEvent(counterEvents.PlayButtonUpsellAgeRestrictionVerificationTriggered);

              sendUnlockPlayIntent(requirement);

              // result can be used for success/failure callback cases in the future
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const success = await startAccessManagementUpsellFlow();
            } catch {
              launchGameFallback();

              fireEvent(counterEvents.PlayButtonUpsellAgeRestrictionVerificationError);

              sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
            }

            break;
          }
          default: {
            launchGameFallback();

            fireEvent(counterEvents.PlayButtonUpsellUnknownRequirement);

            sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
          }
        }
      } else {
        setIsRestrictedUnplayableModalOpen(true);

        fireEvent(counterEvents.PlayButtonUpsellRestrictedUnplayableTriggered);

        sendUnlockPlayIntent(unlockPlayIntentConstants.restrictedUnplayableUpsellName);
      }
    },
    [launchGameFallback, universeId]
  );

  const closeSelfUpdateSettingModal = useCallback(() => {
    setIsSelfUpdateSettingModalOpen(false);
  }, []);

  const closeRestrictedUnplayableModal = useCallback(() => {
    setIsRestrictedUnplayableModalOpen(false);
  }, []);

  const navigateToAccountSettings = useCallback(() => {
    const url = Endpoints.getAbsoluteUrl('/my/account#!/privacy');
    if (typeof window !== 'undefined') {
      window.location.href = url;
      setIsSelfUpdateSettingModalOpen(false);
    }
  }, []);

  return {
    launchPlayButtonUpsell,
    isSelfUpdateSettingModalOpen,
    navigateToAccountSettings,
    closeSelfUpdateSettingModal,
    isRestrictedUnplayableModalOpen,
    closeRestrictedUnplayableModal
  };
};

export default useContextualParentalControlsUpsell;
