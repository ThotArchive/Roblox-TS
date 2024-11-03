import { DialogActions, DialogActionsProps } from '@mui/material';
import React, { FC } from 'react';
import '../scss/dialog.scss';

const StyledDialogContent: FC<Omit<DialogActionsProps, 'classes' | 'className'>> = props => {
  return (
    <DialogActions
      {...props}
      classes={{
        root: 'dialog-actions'
      }}
      disableSpacing
    />
  );
};

export default StyledDialogContent;
