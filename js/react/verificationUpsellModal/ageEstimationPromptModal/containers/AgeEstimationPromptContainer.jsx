import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import { Modal } from 'react-style-guide';
import Persona from 'persona';
import useAgeEstimationPromptModalState from '../hooks/useAgeEstimationPromptModalState';
import startPersonaIdVerification from '../services/ageVerificationService';
import { CLOSE_AGE_ESTIMATION_PROMPT_MODAL } from '../actions/actionTypes';

function AgeEstimationPromptContainer({ translate }) {
  const { dispatch } = useAgeEstimationPromptModalState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startPersonaIdVerification()
      .then(data => {
        if (data?.sessionIdentifier) {
          const personaClient = new Persona.Client({
            inquiryId: data.sessionIdentifier,
            onReady: () => {
              personaClient.open();
              setLoading(false);
            },
            onComplete: ({ inquiryId, status, fields }) => {
              dispatch({ type: CLOSE_AGE_ESTIMATION_PROMPT_MODAL });
            },
            onCancel: ({ inquiryId, sessionToken }) => {
              dispatch({ type: CLOSE_AGE_ESTIMATION_PROMPT_MODAL });
            },
            onError: error => {
              console.error(error);
              dispatch({ type: CLOSE_AGE_ESTIMATION_PROMPT_MODAL });
            }
          });
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error(`Error starting session: ${error}`);
        setLoading(false);
      });
  }, []);

  return (
    <Modal
      className='age-estimation-upsell-modal'
      show={loading}
      keyboard={false} // prevent ESC key from dismissing the modal
      backdrop='static' // prevent clicking on the backdrop to close the modal
      /* eslint-enable */
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered='true'>
      <CircularProgress class='spinner' />
    </Modal>
  );
}
AgeEstimationPromptContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default AgeEstimationPromptContainer;
