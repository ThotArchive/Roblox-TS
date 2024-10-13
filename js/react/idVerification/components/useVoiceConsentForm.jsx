import classNames from 'classnames';
import React, { useState } from 'react';
import { Button } from 'react-style-guide';
import { postShowOverlay } from '../services/voiceChatService';

function useVoiceConsentForm(
  translate,
  buttonStack,
  implicitConsent,
  explicitConsent,
  requireExplicitVoiceConsent
) {
  const [consent, setConsent] = useState(!requireExplicitVoiceConsent);
  const checkbox = (
    <div className='checkbox checkbox-container'>
      {requireExplicitVoiceConsent ? (
        <React.Fragment>
          <input
            type='checkbox'
            checked={consent}
            onClick={() => {
              setConsent(!consent);
              postShowOverlay(consent);
            }}
            id='isShowOverlayChecked'
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor='isShowOverlayChecked' className='voice-modal-checkbox-label'>
            {translate(explicitConsent, {
              linkStart: '',
              linkEnd: ''
            })}
          </label>
        </React.Fragment>
      ) : (
        <span>
          {translate(implicitConsent, {
            linkStart: '',
            linkEnd: ''
          })}
        </span>
      )}
    </div>
  );

  const buttons = buttonStack.map(button => {
    const isPrimaryButton = button.variant === Button.variants.primary;
    return (
      <span key={button.text}>
        <Button
          className={classNames('button-stack-button', {
            'primary-link': isPrimaryButton,
            'secondary-link': !isPrimaryButton
          })}
          variant={button.variant}
          size={Button.sizes.medium}
          isDisabled={requireExplicitVoiceConsent && button.explicitDisable && !consent}
          onClick={button.callback}>
          {translate(button.text)}
        </Button>
      </span>
    );
  });

  return [checkbox, buttons];
}

export default useVoiceConsentForm;
