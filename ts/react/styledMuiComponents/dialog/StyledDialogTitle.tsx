import { DialogTitle, DialogTitleProps, Divider } from '@mui/material';
import React, { FC } from 'react';
import '../scss/dialog.scss';

const StyledDialogTitle: FC<Omit<DialogTitleProps, 'classes' | 'className'>> = props => {
  return (
    <React.Fragment>
      <DialogTitle
        {...props}
        classes={{
          root: 'h2 dialog-header'
        }}
      />
      <Divider classes={{ root: 'dialog-divider' }} />
    </React.Fragment>
  );
};

export default StyledDialogTitle;
