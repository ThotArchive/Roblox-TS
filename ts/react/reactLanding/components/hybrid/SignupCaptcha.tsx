import React, { useEffect, useState } from 'react';
import { AccountIntegrityChallengeService } from 'Roblox';
import { reactSignupCaptchaContainer } from '../../constants/signupConstants';
import {
  TCaptchaDataOptionsUpdatedEvent,
  TCaptchaInputParameters
} from '../../../common/types/captchaTypes';

const { Captcha } = AccountIntegrityChallengeService;

type ChallengeParameters = AccountIntegrityChallengeService.Captcha.ChallengeParameters;

export const SignupCaptcha = (): JSX.Element => {
  const [restoreModal, setRestoreModal] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleCaptcha = (inputParams: TCaptchaInputParameters) => {
      if (restoreModal !== null) {
        restoreModal();
        return;
      }

      const { unifiedCaptchaId, dataExchange } = inputParams;
      const challengeParam: ChallengeParameters = {
        containerId: reactSignupCaptchaContainer,
        actionType: Captcha.ActionType.Signup,
        appType: null,
        dataExchangeBlob: dataExchange,
        unifiedCaptchaId,
        onChallengeDisplayed: () => {
          return null;
        },
        onChallengeCompleted: data => {
          setRestoreModal(null);
          const event = new CustomEvent('ReactCaptchaSuccess', {
            detail: {
              data
            }
          });
          window.dispatchEvent(event);
        },
        onChallengeInvalidated: data => {
          setRestoreModal(null);
          const event = new CustomEvent('ReactCaptchaError', {
            detail: {
              data
            }
          });
          window.dispatchEvent(event);
        },
        renderInline: false,
        // When the user abandons the captcha challenge, the `restoreModal`
        // function is provided for us to re-open the captcha challenge
        // without re-initializing the entire Challenge component again.
        onModalChallengeAbandoned: restoreModalInner => {
          // Note that to save this function to our state variable, we use the
          // confusing `setValue(() => newValue)` syntax because the value we
          // are trying to set here is itself a function (see the `useState`
          // docs for more information, but this call is essentially just doing
          // `restoreModal = restoreModalInner`).
          setRestoreModal(() => restoreModalInner);
          const event = new CustomEvent('ReactCaptchaDismiss', {});
          window.dispatchEvent(event);
          return null;
        }
      };
      if (Captcha) {
        // eslint-disable-next-line no-void
        void Captcha.renderChallenge(challengeParam);
      } else {
        // eslint-disable-next-line no-console
        console.error('No captcha service available');
      }
    };

    const onCaptchaOptionsUpdated = (event: TCaptchaDataOptionsUpdatedEvent) => {
      if (event.detail) {
        const { inputParams } = event.detail;
        handleCaptcha(inputParams);
      }
    };

    window.addEventListener('CaptchaDataOptionsUpdated', onCaptchaOptionsUpdated as EventListener);
    return () => {
      window.removeEventListener(
        'CaptchaDataOptionsUpdated',
        onCaptchaOptionsUpdated as EventListener
      );
    };
  }, [reactSignupCaptchaContainer, restoreModal]);

  return <div id={reactSignupCaptchaContainer} />;
};

export default SignupCaptcha;
