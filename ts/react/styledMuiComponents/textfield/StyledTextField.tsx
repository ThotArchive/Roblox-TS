import { TextField, TextFieldProps } from '@mui/material';
import React, { FC } from 'react';
import '../scss/textfield.scss';

const StyledTextField: FC<TextFieldProps> = props => {
  return (
    <TextField
      {...props}
      InputProps={{
        classes: {
          root: 'styled-input-root',
          multiline: 'styled-input-multiline'
        }
      }}
    />
  );
};

export default StyledTextField;
