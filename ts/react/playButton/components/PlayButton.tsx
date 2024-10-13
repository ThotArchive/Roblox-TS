import React, { useState, useEffect } from 'react';
import { Loading, Button } from 'react-style-guide';
import { createItemPurchase } from 'roblox-item-purchase';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { authenticatedUser } from 'header-scripts';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import { ExperimentationService, NavigationService } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import {
  TPlayabilityStatus,
  TPlayabilityStatuses,
  TGetProductInfo,
  TGetProductDetails,
  TShowAgeVerificationOverlayResponse,
  TUniversePlaceVoiceEnabledSettings
} from '../types/playButtonTypes';
import playButtonService from '../services/playButtonService';
import playButtonConstants from '../constants/playButtonConstants';
import {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startAccessManagementUpsellFlow,
  startAvatarVideoOptInOverlayFlow,
  startVerificationFlow,
  startVoiceOptInOverlayFlow
} from '../utils/playButtonUtils';
import playButtonTranslationConfig from '../../../../translation.config';
import { ActionNeededWrapper } from './ActionNeededButton';

const [ItemPurchase, itemPurchaseService] = createItemPurchase();
const {
  PlayabilityStatus,
  playButtonStatusTranslationMap,
  counterEvents,
  avatarChatUpsellLayer,
  avatarChatUpsellLayerU13
} = playButtonConstants;

type ValueOf<T> = T[keyof T];

export type TPurchaseButtonProps = {
  universeId: string;
  placeId: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  refetchPlayabilityStatus: () => void;
};

export const PurchaseButton = ({
  translate,
  universeId,
  placeId,
  iconClassName = 'icon-robux-white',
  buttonWidth = Button.widths.full,
  buttonClassName = 'btn-common-play-game-lg',
  refetchPlayabilityStatus
}: TPurchaseButtonProps & {
  translate: TranslateFunction;
}): JSX.Element => {
  const [productInfo, setProductInfo] = useState<TGetProductInfo | undefined>(undefined);
  const [productDetails, setProductDetails] = useState<TGetProductDetails | undefined>(undefined);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const response = await playButtonService.getProductInfo([universeId]);
        setProductInfo(response);
      } catch (e) {
        console.log(e);
      }
    };

    const fetchProductDetails = async () => {
      try {
        const response = await playButtonService.getProductDetails([placeId]);
        setProductDetails(response);
      } catch (e) {
        console.log(e);
      }
    };

    // eslint-disable-next-line no-void
    void fetchProductInfo();
    // eslint-disable-next-line no-void
    void fetchProductDetails();
  }, []);

  if (productInfo === undefined || productDetails === undefined) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <Button
        data-testid='play-purchase-button'
        width={buttonWidth}
        className={buttonClassName}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          itemPurchaseService.start();
        }}>
        <span className={iconClassName} />
        <span className='btn-text'>{productInfo.price}</span>{' '}
      </Button>
      <ItemPurchase
        {...{
          translate,
          productId: productInfo.productId,
          expectedPrice: productInfo.price,
          thumbnail: (
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={DefaultThumbnailSize}
              targetId={parseInt(universeId, 10)}
              imgClassName='game-card-thumb'
              format={ThumbnailFormat.jpeg}
            />
          ),
          assetName: productDetails.name,
          assetType: 'Place',
          sellerName: productDetails.builder,
          expectedCurrency: 1,
          expectedSellerId: productInfo.sellerId,
          onPurchaseSuccess: refetchPlayabilityStatus,
          isPlace: true
        }}
      />
    </React.Fragment>
  );
};

export const WithTranslationPurchaseButton = withTranslations<TPurchaseButtonProps>(
  PurchaseButton,
  playButtonTranslationConfig
);

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
  status:
    | TPlayabilityStatuses['Playable']
    | TPlayabilityStatuses['GuestProhibited']
    | TPlayabilityStatuses['ContextualPlayabilityUnverifiedSeventeenPlusUser']; // remove when cleaning up hasUpdatedPlayButtonsIxp as true
  disableLoadingState?: boolean;
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
  disableLoadingState = false
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
        console.error(e);
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

            launchGame(
              placeId,
              rootPlaceId,
              privateServerLinkCode,
              gameInstanceId,
              eventProperties
            );
          } else if (status === PlayabilityStatus.GuestProhibited) {
            // if it is vng, redirect user to login page directly
            if (isVNGRedirectEnabled) {
              // redirct to login page
              NavigationService?.navigateToLoginWithRedirect();
            } else {
              launchLogin(placeId);
            }
          } else if (
            // remove this case when cleaning up hasUpdatedPlayButtonsIxp as true
            status === PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser
          ) {
            fireEvent(counterEvents.SeventeenPlusInPlayable);
            // can be used for success/failure callback cases in the future
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const success = await startAccessManagementUpsellFlow();
          }
        }}>
        <span className={iconClassName} />
      </Button>
      <div id='id-verification-container' />
      <div id='access-management-upsell-container' />
    </React.Fragment>
  );
};

export type TErrorProps = {
  playabilityStatus: Exclude<
    TPlayabilityStatus,
    | TPlayabilityStatuses['Playable']
    | TPlayabilityStatuses['GuestProhibited']
    | TPlayabilityStatuses['PurchaseRequired']
    | TPlayabilityStatuses['ContextualPlayabilityUnverifiedSeventeenPlusUser']
  >;
};

export const Error = ({
  translate,
  playabilityStatus
}: TErrorProps & {
  translate: TranslateFunction;
}): JSX.Element => (
  <span data-testid='play-error' className='error-message'>
    {translate(playButtonStatusTranslationMap[playabilityStatus])}
  </span>
);

export const WithTranslationError = withTranslations<TErrorProps>(
  Error,
  playButtonTranslationConfig
);

export type TDefaultPlayButtonProps = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  refetchPlayabilityStatus: () => Promise<void>;
  playabilityStatus: TPlayabilityStatus | undefined;
  eventProperties?: Record<string, number | string | undefined>;
};

export const DefaultPlayButton = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  refetchPlayabilityStatus,
  playabilityStatus,
  eventProperties = {}
}: TDefaultPlayButtonProps): JSX.Element => {
  switch (playabilityStatus) {
    case undefined:
      return <Loading />;
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
        />
      );
    case PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser:
      fireEvent(counterEvents.ActionNeeded);
      return (
        <ActionNeededWrapper
          universeId={universeId}
          placeId={placeId}
          rootPlaceId={rootPlaceId}
          privateServerLinkCode={privateServerLinkCode}
          gameInstanceId={gameInstanceId}
          status={playabilityStatus}
          eventProperties={eventProperties}
        />
      );
    case PlayabilityStatus.PurchaseRequired:
      return (
        <WithTranslationPurchaseButton
          refetchPlayabilityStatus={refetchPlayabilityStatus}
          universeId={universeId}
          placeId={placeId}
        />
      );
    default:
      fireEvent(counterEvents.Unplayable);
      return <WithTranslationError playabilityStatus={playabilityStatus} />;
  }
};
