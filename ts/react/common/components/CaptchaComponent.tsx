import React, { useEffect, useState } from 'react';
import { AccountIntegrityChallengeService } from 'Roblox';
import {
  TCaptchaInputParams,
  TOnCaptchaChallengeCompletedData,
  TOnCaptchaChallengeInvalidatedData,
  TCaptchaChallengeParameters
} from '../types/captchaTypes';

const { Captcha } = AccountIntegrityChallengeService;

export type captchaProps = {
  containerId: string;
  actionType: AccountIntegrityChallengeService.Captcha.ActionType;
  dataExchange: string;
  unifiedCaptchaId: string;
  onCaptchaChallengeCompleted: (data: TOnCaptchaChallengeCompletedData) => void;
  onCaptchaChallengeInvalidated: (data: TOnCaptchaChallengeInvalidatedData) => void;
  onCaptchaChallengeAbandoned: () => void;
  onUnknownError: () => void;
};

export const CaptchaComponent = ({
  containerId,
  actionType,
  dataExchange,
  unifiedCaptchaId,
  onCaptchaChallengeCompleted,
  onCaptchaChallengeInvalidated,
  onCaptchaChallengeAbandoned,
  onUnknownError
}: captchaProps): JSX.Element => {
  const [restoreModal, setRestoreModal] = useState<(() => void) | null>(null);

  const handleCaptcha = (inputParams: TCaptchaInputParams) => {
    if (restoreModal !== null) {
      restoreModal();
      return;
    }
    const challengeParam: TCaptchaChallengeParameters = {
      containerId,
      actionType,
      appType: null,
      dataExchangeBlob: inputParams.dataExchange,
      unifiedCaptchaId: inputParams.unifiedCaptchaId,
      onChallengeDisplayed: data => {
        return null;
      },
      onChallengeCompleted: data => {
        setRestoreModal(null);
        onCaptchaChallengeCompleted(data);
      },
      onChallengeInvalidated: data => {
        setRestoreModal(null);
        onCaptchaChallengeInvalidated(data);
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
        onCaptchaChallengeAbandoned();
        return null;
      }
    };
    if (Captcha) {
      Captcha.renderChallenge(challengeParam)
        .then(success => {
          if (!success) {
            onUnknownError();
          }
        })
        .catch(() => {
          onUnknownError();
        });
    } else {
      console.error('no captcha service available');
    }
  };

  useEffect(() => {
    if (dataExchange && unifiedCaptchaId) {
      handleCaptcha({
        dataExchange,
        unifiedCaptchaId
      });
    }
  }, [dataExchange + unifiedCaptchaId]);

  return <div id={containerId} />;
};

export default CaptchaComponent;
