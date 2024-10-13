import React from 'react';

export type InlineFooterButtonConfig = {
  content: JSX.Element | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type Props = {
  positiveButton: InlineFooterButtonConfig;
  negativeButton: InlineFooterButtonConfig | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A modal footer with a positive action button (and an optional negative
 * action button).
 */
export const InlineChallengeFooter: React.FC<Props> = ({
  positiveButton,
  negativeButton,
  children
}: Props) => {
  return (
    <div className='inline-challenge-footer'>
      <div className='inline-challenge-footer-buttons'>
        {negativeButton !== null && (
          <button
            type='button'
            className='btn-secondary-md inline-challenge-footer-button'
            aria-label={negativeButton.label}
            disabled={!negativeButton.enabled}
            onClick={negativeButton.action}>
            {negativeButton.content}
          </button>
        )}
        <button
          type='button'
          className='btn-cta-md inline-challenge-footer-button'
          aria-label={positiveButton.label}
          disabled={!positiveButton.enabled}
          onClick={positiveButton.action}>
          {positiveButton.content}
        </button>
      </div>
      {children}
    </div>
  );
};
