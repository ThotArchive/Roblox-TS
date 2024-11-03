import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-style-guide';
import '../../../../css/common/_errorStatus.scss';

const { variants } = Button;

export const ErrorStatus = ({
  errorMessage,
  onRefresh,
  className
}: {
  className?: string;
  errorMessage: string;
  onRefresh: () => void;
}): JSX.Element => {
  return (
    <div data-testid='error-status' className={classNames('game-error', className)}>
      <span className='icon-spot-error-2xl' />
      <p className='text-label error-text'>{errorMessage}</p>
      <Button className='refresh-button' variant={variants.control} onClick={onRefresh}>
        <span className='icon-common-refresh' />
      </Button>
    </div>
  );
};

ErrorStatus.defaultProps = {
  className: ''
};

export default ErrorStatus;
