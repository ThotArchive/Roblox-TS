import React, { useState } from 'react';
import { Button } from 'react-style-guide';

function useCameraConsentForm(
  translate,
  implicitConsent,
  explicitConsent,
  requireExplicitCameraConsent,
  buttons
) {
  const [consent, setConsent] = useState(!requireExplicitCameraConsent);
  const checkbox = (
    <div className='checkbox checkbox-container'>
      {requireExplicitCameraConsent ? (
        <React.Fragment>
          <input
            type='checkbox'
            checked={consent}
            onClick={() => {
              setConsent(!consent);
            }}
            id='isShowOverlayChecked'
          />
          <label htmlFor='isShowOverlayChecked' className='voice-modal-checkbox-label'>
            {translate(explicitConsent)}
          </label>
        </React.Fragment>
      ) : (
        <span>{translate(implicitConsent)}</span>
      )}
    </div>
  );

  const buttonMarkup = buttons.map(buttonInfo => (
    <div className='half-flex' key={buttonInfo.text}>
      <Button
        className='button-stack-button secondary-link'
        variant='secondary'
        size={Button.sizes.medium}
        isDisabled={requireExplicitCameraConsent && buttonInfo.explicitDisable && !consent}
        onClick={buttonInfo.callback}>
        {translate(buttonInfo.text)}
      </Button>
    </div>
  ));

  return [checkbox, buttonMarkup];
}

export default useCameraConsentForm;
