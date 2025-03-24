import { authenticatedUser } from 'header-scripts';
import React, { useEffect, useState } from 'react';
import { Button, Loading } from 'react-style-guide';

import { ExperimentationService, NavigationService } from 'Roblox';
import { TValidHttpUrl } from 'core-utilities';
import { fireEvent } from 'roblox-event-tracker';
import playButtonConstants from '../constants/playButtonConstants';
import playButtonService from '../services/playButtonService';
import {
  TPlayabilityStatus,
  TPlayabilityStatuses,
  TShowAgeVerificationOverlayResponse,
  TUniversePlaceVoiceEnabledSettings,
  ValueOf
} from '../types/playButtonTypes';
import {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startAccessManagementUpsellFlow,
  startAvatarVideoOptInOverlayFlow,
  startVerificationFlow,
  startVoiceOptInOverlayFlow
} from '../utils/playButtonUtils';
import ParentalControlsActionNeededButton from './ParentalControlsActionNeededButton';
import PurchaseButton from './PurchaseButtonContainer';
import SeventeenPlusActionNeededButton from './SeventeenPlusActionNeededButton';
import UnplayableButton from './UnplayableButton';

const {
  PlayabilityStatus,
  counterEvents,
  avatarChatUpsellLayer,
  avatarChatUpsellLayerU13,
  playButtonLayer
} = playButtonConstants;

const getShowIdentityVerificationFlow = async (
  universeId: string
): Promise<TShowAgeVerificationOverlayResponse> => {
  const defaultUniverseSettings: TUniversePlaceVoiceEnabledSettings = {
    isUniverseEnabledForVoice: false,
    isUniverseEnabledForAvatarVideo: false
  };

  if (!authenticatedUser.isAuthenticated) {
    return {
      elegibleToSeeVoiceUpsell: false,
      universePlaceVoiceEnabledSettings: defaultUniverseSettings,
      showAgeVerificationOverlay: false,
      showVoiceOptInOverlay: false,
      showAvatarVideoOptInOverlay: false,
      requireExplicitVoiceConsent: true,
      useCameraU13Design: false,
      useVoiceUpsellV2Design: false
    };
  }

  const {
    playButtonOverlayWebFlag,
    voiceOptInWebFlag,
    cameraOptInWebFlag: cameraOptInWebFlagO13,
    cameraOptInWebFlagU13,
    requireExplicitVoiceConsent,
    useCameraU13Design,
    useVoiceUpsellV2Design
  } = await playButtonService.getGuacPlayButtonUI();

  // TODO: remove this check if playButtonOverlayWebFlag is always true
  if (!playButtonOverlayWebFlag && !(voiceOptInWebFlag || cameraOptInWebFlagO13)) {
    return {
      elegibleToSeeVoiceUpsell: false,
      universePlaceVoiceEnabledSettings: defaultUniverseSettings,
      showAgeVerificationOverlay: false,
      showVoiceOptInOverlay: false,
      showAvatarVideoOptInOverlay: false,
      requireExplicitVoiceConsent,
      useCameraU13Design,
      useVoiceUpsellV2Design
    };
  }

  const {
    showAgeVerificationOverlay,
    showVoiceOptInOverlay,
    showAvatarVideoOptInOverlay,
    elegibleToSeeVoiceUpsell,
    universePlaceVoiceEnabledSettings
  } = await playButtonService.getShowAgeVerificationOverlay(universeId);

  let shouldShowUpsellO13 = false;
  let shouldShowUpsellU13 = false;

  if (ExperimentationService.getAllValuesForLayer) {
    shouldShowUpsellO13 = Boolean(
      (await ExperimentationService.getAllValuesForLayer(avatarChatUpsellLayer)).ShouldShowUpsell
    );

    shouldShowUpsellU13 = Boolean(
      (await ExperimentationService.getAllValuesForLayer(avatarChatUpsellLayerU13)).ShouldShowUpsell
    );
  }

  return {
    elegibleToSeeVoiceUpsell,
    universePlaceVoiceEnabledSettings,
    showAgeVerificationOverlay: playButtonOverlayWebFlag && showAgeVerificationOverlay,
    showVoiceOptInOverlay: voiceOptInWebFlag && showVoiceOptInOverlay,
    showAvatarVideoOptInOverlay:
      showAvatarVideoOptInOverlay &&
      ((cameraOptInWebFlagO13 && shouldShowUpsellO13) ||
        (cameraOptInWebFlagU13 && shouldShowUpsellU13)),
    requireExplicitVoiceConsent,
    useCameraU13Design,
    useVoiceUpsellV2Design
  };
};

const getJoindata = () => {
  const launchData = new URLSearchParams(window.location.search).get('launchData') ?? undefined;
  const eventId = new URLSearchParams(window.location.search).get('eventId') ?? undefined;
  return {
    launchData,
    eventId
  };
};

export type TPlayButtonProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  eventProperties?: Record<string, string | number | undefined>;
  status: TPlayabilityStatuses['Playable'] | TPlayabilityStatuses['GuestProhibited'];
  disableLoadingState?: boolean;
  buttonText?: string | undefined;
  hideIcon?: boolean;
  analyticsCallback?: () => void;
};

export const PlayButton = ({
  universeId,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  status,
  eventProperties = {},
  iconClassName = 'icon-common-play',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-lg',
  disableLoadingState = false,
  buttonText = undefined,
  hideIcon = false,
  analyticsCallback = undefined
}: TPlayButtonProps): JSX.Element => {
  const [isExperienceVoiceEnabled, setIsExperienceVoiceEnabled] = useState<boolean | undefined>(
    undefined
  );
  const [showVerification, setShowVerification] = useState<boolean | undefined>(undefined);
  const [elegibleToSeeVoiceUpsell, setElegibleToSeeVoiceUpsell] = useState<boolean | undefined>(
    undefined
  );
  const [showVoiceOptIn, setShowVoiceOptIn] = useState<boolean | undefined>(undefined);
  const [showAvatarVideoOptIn, setShowAvatarVideoOptIn] = useState<boolean | undefined>(undefined);
  const [requireExplicitVoiceConsent, setRequireExplicitVoiceConsent] = useState<
    boolean | undefined
  >(undefined);
  const [useCameraU13Design, setUseCameraU13Design] = useState<boolean | undefined>(undefined);
  const [useVoiceUpsellV2Design, setUseVoiceUpsellV2Design] = useState<boolean | undefined>(
    undefined
  );
  const [isVNGRedirectEnabled, setIsVNGRedirectEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const isVNGComplianceEnabled = await NavigationService?.getIsVNGLandingRedirectEnabled();
      setIsVNGRedirectEnabled(isVNGComplianceEnabled);
    };
    try {
      // eslint-disable-next-line no-void
      void fetchData();
    } catch (e) {
      // fall back to false for VNG redirect
      setIsVNGRedirectEnabled(false);
    }
  }, []);

  useEffect(() => {
    const fetchShowIdentityVerificationFlow = async () => {
      try {
        const showIdentityVerificationFlow = await getShowIdentityVerificationFlow(universeId);
        setIsExperienceVoiceEnabled(
          showIdentityVerificationFlow.universePlaceVoiceEnabledSettings
            ?.isUniverseEnabledForVoice ?? false
        );
        setElegibleToSeeVoiceUpsell(showIdentityVerificationFlow.elegibleToSeeVoiceUpsell);
        setShowVerification(showIdentityVerificationFlow.showAgeVerificationOverlay);
        setShowVoiceOptIn(showIdentityVerificationFlow.showVoiceOptInOverlay);
        setShowAvatarVideoOptIn(showIdentityVerificationFlow.showAvatarVideoOptInOverlay);
        setRequireExplicitVoiceConsent(showIdentityVerificationFlow.requireExplicitVoiceConsent);
        setUseCameraU13Design(showIdentityVerificationFlow.useCameraU13Design);
        setUseVoiceUpsellV2Design(showIdentityVerificationFlow.useVoiceUpsellV2Design);
      } catch (e) {
        fireEvent(counterEvents.PlayButtonShowIdentificationError);
        setElegibleToSeeVoiceUpsell(false);
        setIsExperienceVoiceEnabled(false);
        setShowVerification(false);
        setShowVoiceOptIn(false);
        setShowAvatarVideoOptIn(false);
        setRequireExplicitVoiceConsent(true); // assume consent is required
        setUseCameraU13Design(false); // TODO: EXPR-907 clean up useCameraU13Design
        setUseVoiceUpsellV2Design(false);
      }
    };

    // eslint-disable-next-line no-void
    void fetchShowIdentityVerificationFlow();
  }, []);

  if (showVerification === undefined && !disableLoadingState) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <Button
        data-testid='play-button'
        width={buttonWidth}
        className={buttonClassName}
        onClick={async e => {
          e.preventDefault();
          e.stopPropagation();

          if (status === PlayabilityStatus.Playable) {
            if (elegibleToSeeVoiceUpsell && isExperienceVoiceEnabled) {
              const layerName = 'SocialVoice.VoiceUpsell';
              // you must fetch ixp layer values before sending exposure event.
              const ixpPromise = ExperimentationService.getAllValuesForLayer(layerName);
              ixpPromise
                .then(() => {
                  ExperimentationService.logLayerExposure(layerName);
                })
                .catch(() => console.error('error logging exposure event in play-join'));
            }

            if (showVerification) {
              const [_, didVerifyAge] = await startVerificationFlow();
              if (didVerifyAge) {
                setShowVerification(false);
              }
            } else if (showVoiceOptIn) {
              const success = await startVoiceOptInOverlayFlow(
                requireExplicitVoiceConsent ?? true,
                useVoiceUpsellV2Design ?? false
              );
              if (success) {
                setShowVoiceOptIn(false);
              }
            } else if (showAvatarVideoOptIn) {
              const success = await startAvatarVideoOptInOverlayFlow(
                requireExplicitVoiceConsent ?? true,
                useCameraU13Design ?? true
              );
              if (success) {
                setShowAvatarVideoOptIn(false);
              }
            }

            handleShareLinkEventLogging(placeId, universeId);

            const joinData = getJoindata();

            launchGame(
              placeId,
              rootPlaceId,
              privateServerLinkCode,
              gameInstanceId,
              eventProperties,
              joinData
            );
          } else if (status === PlayabilityStatus.GuestProhibited) {
            // if it is vng, redirect user to login page directly
            if (isVNGRedirectEnabled) {
              // redirct to login page
              NavigationService?.navigateToLoginWithRedirect();
            } else {
              launchLogin(placeId);
            }
          }

          if (analyticsCallback) {
            analyticsCallback();
          }
        }}>
        {!hideIcon && <span className={iconClassName} />}
        {buttonText && <span className='play-button-text'>{buttonText}</span>}
      </Button>
      <div id='id-verification-container' />
    </React.Fragment>
  );
};

export type TDefaultPlayButtonProps = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  refetchPlayabilityStatus: () => Promise<void>;
  playabilityStatus: TPlayabilityStatus | undefined;
  hideButtonText?: boolean;
  showUnplayableError?: boolean;
  eventProperties?: Record<string, number | string | undefined>;
  disableLoadingState?: boolean;
  buttonClassName?: string;
  redirectPurchaseUrl?: TValidHttpUrl;
  showDefaultPurchaseText?: boolean;
};

export const DefaultPlayButton = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  refetchPlayabilityStatus,
  playabilityStatus,
  hideButtonText,
  eventProperties = {},
  disableLoadingState,
  buttonClassName,
  redirectPurchaseUrl,
  showDefaultPurchaseText
}: TDefaultPlayButtonProps): JSX.Element => {
  switch (playabilityStatus) {
    case undefined:
      if (!disableLoadingState) {
        return <Loading />;
      }

      return (
        <PlayButton
          universeId={universeId}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          status={PlayabilityStatus.Playable}
          eventProperties={eventProperties}
          disableLoadingState={disableLoadingState}
          buttonClassName={buttonClassName}
        />
      );
    case PlayabilityStatus.Playable:
    case PlayabilityStatus.GuestProhibited:
      return (
        <PlayButton
          universeId={universeId}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          status={playabilityStatus}
          eventProperties={eventProperties}
          disableLoadingState={disableLoadingState}
          buttonClassName={buttonClassName}
        />
      );
    case PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser:
      fireEvent(counterEvents.ActionNeeded);

      return (
        <SeventeenPlusActionNeededButton
          universeId={universeId}
          hideButtonText={hideButtonText}
          buttonClassName={buttonClassName}
        />
      );
    case PlayabilityStatus.PurchaseRequired:
    case PlayabilityStatus.FiatPurchaseRequired:
      return (
        <PurchaseButton
          refetchPlayabilityStatus={refetchPlayabilityStatus}
          universeId={universeId}
          placeId={placeId}
          hideButtonText={hideButtonText}
          buttonClassName={buttonClassName}
          redirectPurchaseUrl={redirectPurchaseUrl}
          playabilityStatus={playabilityStatus}
          showDefaultPurchaseText={showDefaultPurchaseText}
        />
      );
    case PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls:
      fireEvent(counterEvents.ActionNeeded);

      return (
        <ParentalControlsActionNeededButton
          universeId={universeId}
          hideButtonText={hideButtonText}
          buttonClassName={buttonClassName}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          eventProperties={eventProperties}
        />
      );
    default:
      fireEvent(counterEvents.Unplayable);

      return <UnplayableButton hideButtonText={hideButtonText} buttonClassName={buttonClassName} />;
  }
};
