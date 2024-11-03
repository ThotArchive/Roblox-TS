import React, { FC } from 'react';
import { Controller } from 'react-hook-form';
import { TextField } from '../../styledMuiComponents/index';
import { useNotificationLocalization } from '../context/NotificationsLocalization';
import { AbuseReportInputProps } from './abuseReportFormType';
import { REPORTER_COMMENT_LIMIT } from './constants/abuseReportConstants';

const AbuseReportInput: FC<AbuseReportInputProps> = ({
  control,
  config,
  errors,
  register,
  disabled
}) => {
  // TODO: move translation to separate namespace and remove dependency from notifications
  const translate = useNotificationLocalization();

  const getHelperText = (
    error: Partial<{ type: string | number; message: string }> | undefined
  ) => {
    if (error && error.type === 'required') {
      return translate('Error.FieldRequired');
    }
    if (error && error.type === 'maxLength') {
      return translate('Error.MaxLength.AbuseReporterComment', {
        maxLength: REPORTER_COMMENT_LIMIT
      });
    }
    return undefined;
  };

  if (config.type === 'textfield') {
    return (
      <Controller
        name={config.name as never}
        control={control}
        rules={config.validation}
        render={({ onChange, onBlur, value, ref }) => (
          <TextField
            value={value as unknown}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>}
            onBlur={onBlur as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>}
            id={config.name}
            inputRef={ref as React.Ref<unknown>}
            placeholder={config.placeHolder}
            error={!!errors[config.name]}
            multiline
            minRows={6}
            fullWidth
            required
            helperText={getHelperText(errors[config.name])}
            disabled={disabled}
          />
        )}
      />
    );
  }
  if (config.type === 'select') {
    // using native select because MUI select has issues with windows webview
    return (
      <React.Fragment>
        <label className='text-label' htmlFor={config.name}>
          {config.label}
        </label>
        <div className='rbx-select-group select-group'>
          <select
            name={config.name}
            ref={register(config.validation)}
            className='input-field rbx-select select-option select-label'
            id={config.name}
            disabled={disabled}>
            {config.options?.map(menuOption => (
              <option key={menuOption.label} value={menuOption.value}>
                {menuOption.label}
              </option>
            ))}
          </select>
          <span className='icon-arrow icon-down-16x16' />
        </div>
      </React.Fragment>
    );
  }
  return null;
};

export default AbuseReportInput;
