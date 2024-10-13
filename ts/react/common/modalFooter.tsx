import React from 'react';
import { Modal } from 'react-style-guide';

export type FooterButtonConfig = {
  content: JSX.Element | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type Props = {
  positiveButton: FooterButtonConfig;
  negativeButton: FooterButtonConfig | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A modal footer with a positive action button (and an optional negative
 * action button).
 */
export const FragmentModalFooter: React.FC<Props> = ({
  positiveButton,
  negativeButton,
  children
}: Props) => {
  return (
    <Modal.Footer>
      <div className='modal-modern-footer-buttons'>
        {negativeButton !== null && (
          <button
            type='button'
            className='btn-secondary-md modal-modern-footer-button'
            aria-label={negativeButton.label}
            disabled={!negativeButton.enabled}
            onClick={negativeButton.action}>
            {negativeButton.content}
          </button>
        )}
        <button
          type='button'
          className='btn-cta-md modal-modern-footer-button'
          aria-label={positiveButton.label}
          disabled={!positiveButton.enabled}
          onClick={positiveButton.action}>
          {positiveButton.content}
        </button>
      </div>
      {children}
    </Modal.Footer>
  );
};
