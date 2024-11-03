import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import translationConfig from '../translation.config';

type DeeplinkFailModalProps = {
  show: boolean;
  closeCallback: () => void;
};

const DeeplinkFailModal = ({
  translate,
  show,
  closeCallback
}: DeeplinkFailModalProps & WithTranslationsProps): JSX.Element => {
  return (
    <Dialog
      maxWidth='md'
      onClose={closeCallback}
      open={show}
      PaperProps={{ className: 'experience-join-failure-modal' }}>
      <DialogTitle className='join-failure-modal-title border-bottom'>
        {translate('Heading.JoinFailed')}
      </DialogTitle>
      <DialogContent className='join-failure-modal-content-root'>
        <DialogContentText className='join-failure-modal-body text'>
          {translate('Response.UnexpectedError')}
        </DialogContentText>
      </DialogContent>
      <DialogActions className='join-failure-modal-actions'>
        <Button className='join-failure-modal-button' onClick={closeCallback} variant='outlined'>
          {translate('Action.Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTranslations(DeeplinkFailModal, translationConfig);
