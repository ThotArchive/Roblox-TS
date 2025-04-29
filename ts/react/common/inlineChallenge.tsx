import React from 'react';

type Props = {
  titleText: string | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * An inline challenge.
 */
const InlineChallenge: React.FC<Props> = ({ titleText, children }: Props) => {
  return (
    <div className='inline-challenge'>
      {titleText && <h4 className='inline-challenge-title'>{titleText}</h4>}
      <div className='inline-challenge-content'>{children}</div>
    </div>
  );
};

export default InlineChallenge;
