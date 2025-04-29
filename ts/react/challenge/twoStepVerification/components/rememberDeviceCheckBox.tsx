import React from 'react';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';

type Props = {
  disabled: boolean;
  rememberDevice: boolean;
  setRememberDevice: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

/**
 * A check box for the user preference to remember a 2SV device.
 */
const RememberDeviceCheckBox: React.FC<Props> = ({
  disabled,
  rememberDevice,
  setRememberDevice,
  className
}: Props) => {
  const {
    state: { resources }
  } = useTwoStepVerificationContext();

  const onCheckBoxChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberDevice(event.target.checked);
  };

  return (
    <p className={className}>
      <input
        id='remember-device'
        type='checkbox'
        onChange={onCheckBoxChanged}
        checked={rememberDevice}
        disabled={disabled}
        tabIndex={0}
      />{' '}
      <label htmlFor='remember-device'>{resources.Label.TrustThisDevice}</label>
    </p>
  );
};

export default RememberDeviceCheckBox;
