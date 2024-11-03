import PropTypes from 'prop-types';
import React from 'react';
import { Button, Modal } from 'react-style-guide';

function FbSunsetSuccessModalContent({ translate, handleClickDone }) {
  return (
    <div>
      <Modal.Header useBaseBootstrapComponent>
        <div className='facebook-sunset-modal-title-container'>
          <button type='button' className='facebook-sunset-title-button' onClick={handleClickDone}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.Success')}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='success-modal-image' />
        <div className='facebook-sunset-modal-body-text'>
          {translate('Description.AddPasswordModalSuccess')}
        </div>
        <Button
          className='modal-button facebook-sunset-btn'
          variant={Button.variants.cta}
          size={Button.sizes.medium}
          onClick={handleClickDone}>
          {translate('Action.Done')}
        </Button>
      </Modal.Body>
    </div>
  );
}

FbSunsetSuccessModalContent.propTypes = {
  translate: PropTypes.func.isRequired,
  handleClickDone: PropTypes.func.isRequired
};

export default FbSunsetSuccessModalContent;
