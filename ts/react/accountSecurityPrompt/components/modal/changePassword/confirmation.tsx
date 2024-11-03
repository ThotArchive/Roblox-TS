import React from 'react';
import { Modal } from 'react-style-guide';
import { FragmentModalHeader, HeaderButtonType } from '../../../../common/modalHeader';
import { ModalFragmentProps } from '../../../constants/types';
import useAccountSecurityPromptContext from '../../../hooks/useAccountSecurityPromptContext';

/**
 * The confirmation page of the change password modal flow.
 */
const ModalChangePasswordConfirmation: React.FC<ModalFragmentProps> = ({
  closeModal
}: ModalFragmentProps) => {
  const {
    state: { resources }
  } = useAccountSecurityPromptContext();

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <FragmentModalHeader
        headerText={resources.Header.Success}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled
        headerInfo={null}
      />
      <Modal.Body>
        <div className='modal-lock-icon' />
        <p className='modal-margin-bottom-large'>
          {resources.Description.ChangeYourPasswordSuccess}
        </p>
      </Modal.Body>
    </React.Fragment>
  );
};

export default ModalChangePasswordConfirmation;
