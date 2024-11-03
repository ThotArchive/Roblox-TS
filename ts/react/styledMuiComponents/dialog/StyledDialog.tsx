import { Dialog, DialogProps } from '@mui/material';
import React, { FC } from 'react';
import '../scss/dialog.scss';

const StyledDialog: FC<Omit<DialogProps, 'classes'> & { isPhone: boolean }> = ({
  isPhone,
  ...props
}) => {
  return (
    <Dialog
      {...props}
      classes={{
        container: 'dialog',
        paper: `dialog-paper ${isPhone ? 'dialog-paper-mobile' : ''}`
      }}
    />
  );
};

export default StyledDialog;
