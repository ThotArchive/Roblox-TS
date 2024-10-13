import React, { useEffect } from 'react';
import { Dialog, Endpoints, AccountIntegrityChallengeService, CurrentUser } from 'Roblox';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import {
  checkTwoStepVerificationEnabled,
  generateTwoStepVerificationToken,
  redeemTwoStepVerificationChallenge
} from '../services/twoStepVerificationService';
import translationConfig from '../translation.config';

const { TwoStepVerification } = AccountIntegrityChallengeService;

function showSuccessBanner({
  systemFeedbackService,
  translate
}: {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
}) {
  systemFeedbackService.success(translate('Response.SuccessfulVerificationV2'));
}

function showErrorBanner({
  systemFeedbackService,
  translate
}: {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
}) {
  systemFeedbackService.warning(translate('Response.VerificationError'));
}

function promptToEnableTwoStepVerification({ translate }: { translate: TranslateFunction }) {
  const settingsRedirectModalProperties = {
    titleText: translate('Heading.TwoStepVerificationRequiredV3'),
    bodyContent: translate('Message.TwoStepVerificationRequiredV4'),
    imageUrl: undefined, // alertImageUrl,
    acceptText: translate('Action.GoToSecurity'),
    acceptColor: 'btn-primary-md',
    onAccept: () => {
      window.location.href = Endpoints.getAbsoluteUrl('/my/account#!/security');
    },
    declineText: translate('Action.Cancel'),
    dismissable: true,
    allowHtmlContentInBody: true,
    onOpenCallback: () => {
      // sendClickEvents();
    }
  };
  Dialog.open(settingsRedirectModalProperties);
}

async function renderTwoStepVerificationModal({
  stopTwoStepVerification,
  systemFeedbackService,
  totalAttempts,
  translate
}: {
  stopTwoStepVerification: () => void;
  systemFeedbackService: TSystemFeedbackService;
  totalAttempts?: number | undefined;
  translate: TranslateFunction;
}) {
  const challengeToken = await generateTwoStepVerificationToken();

  if (challengeToken) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    AccountIntegrityChallengeService.TwoStepVerification.renderChallenge({
      containerId: 'two-sv-popup-entry',
      userId: CurrentUser.userId,
      challengeId: challengeToken,
      actionType: TwoStepVerification.ActionType.RobuxSpend,
      renderInline: false,
      shouldShowRememberDeviceCheckbox: false,
      onChallengeCompleted: async challengeRes => {
        const redeemRes = await redeemTwoStepVerificationChallenge(
          challengeToken,
          challengeRes.verificationToken
        );

        stopTwoStepVerification();
        if (redeemRes) {
          showSuccessBanner({ systemFeedbackService, translate });
        } else {
          showErrorBanner({ systemFeedbackService, translate });
        }
      },
      onChallengeInvalidated: () => {
        const attempts = totalAttempts || 0;
        if (attempts < 3) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          renderTwoStepVerificationModal({
            stopTwoStepVerification,
            systemFeedbackService,
            translate,
            totalAttempts: attempts + 1
          });
        } else {
          showErrorBanner({ systemFeedbackService, translate });
          stopTwoStepVerification();
        }
      },
      onModalChallengeAbandoned: () => {
        /* */
      }
    });
  } else {
    showErrorBanner({ systemFeedbackService, translate });
  }
}

function TwoStepVerificationModal({
  translate,
  isTwoStepVerificationActive,
  stopTwoStepVerification,
  systemFeedbackService
}: {
  translate: TranslateFunction;
  isTwoStepVerificationActive: boolean;
  stopTwoStepVerification: () => void;
  systemFeedbackService: TSystemFeedbackService;
}) {
  useEffect(() => {
    if (!isTwoStepVerificationActive) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      // if user has 2sv, render the verification modal. Otherwise, prompt them
      // to enable 2sv.
      const is2svEnabled = await checkTwoStepVerificationEnabled();
      if (is2svEnabled) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        renderTwoStepVerificationModal({
          stopTwoStepVerification,
          systemFeedbackService,
          translate
        });
      } else {
        promptToEnableTwoStepVerification({ translate });
      }
    })();
  }, [isTwoStepVerificationActive]);

  return <div id='two-sv-popup-entry' />;
}

export default withTranslations(TwoStepVerificationModal, translationConfig.purchasingResources);
