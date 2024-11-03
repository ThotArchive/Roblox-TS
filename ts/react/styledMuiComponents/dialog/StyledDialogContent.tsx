import { DialogContent, DialogContentProps } from '@mui/material';
import React, { FC } from 'react';
import '../scss/dialog.scss';

const StyledDialogContent: FC<Omit<DialogContentProps, 'classes' | 'className'>> = props => {
  return <DialogContent {...props} classes={{ root: 'dialog-content' }} />;
};

export default StyledDialogContent;
