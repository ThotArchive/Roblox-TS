/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { ChangeEvent } from 'react';

export type legalCheckboxProps = {
  id: string;
  legalText: string;
  isChecked: boolean;
  disabled?: boolean;
  onCheckBoxChanged?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const LegalCheckbox: React.FC<legalCheckboxProps> = ({
  id,
  legalText,
  isChecked = false,
  disabled = false,
  onCheckBoxChanged
}: legalCheckboxProps) => {
  return (
    <div className='legal-text-container'>
      <div className='terms-agreement terms-agreement-checkbox'>
        <input
          id={id}
          className='checkbox'
          type='checkbox'
          checked={isChecked}
          onChange={onCheckBoxChanged}
          disabled={disabled}
        />
        <label htmlFor={id} dangerouslySetInnerHTML={{ __html: legalText }} />
      </div>
    </div>
  );
};

export default LegalCheckbox;
