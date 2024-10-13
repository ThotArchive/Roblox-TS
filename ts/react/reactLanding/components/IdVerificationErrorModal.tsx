import React, { useEffect } from 'react';
import { createModal } from 'react-style-guide';

import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { idVerificationTranslationConfig } from '../translation.config';
import { signupFormStrings } from '../constants/signupConstants';
import { identityVerificationResultTokenErrorHandler } from '../utils/identityVerificationUtils';

const IdVerificationErrorModal = ({
  hasIdVerificationError,
  translate
}: {
  hasIdVerificationError: boolean;
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  const [Modal, modalService] = createModal();

  useEffect(() => {
    modalService.open();
  }, [hasIdVerificationError]);

  return (
    <Modal
      title={translate(signupFormStrings.IdVerificationErrorTitle)}
      body={<p>{translate(signupFormStrings.IdVerificationErrorBody)}</p>}
      neutralButtonText={translate(signupFormStrings.TryAgain)}
      onNeutral={identityVerificationResultTokenErrorHandler}
    />
  );
};

export default withTranslations(IdVerificationErrorModal, idVerificationTranslationConfig);
