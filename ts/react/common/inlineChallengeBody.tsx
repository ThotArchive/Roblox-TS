import React from 'react';

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * An inline challenge body.
 */
const InlineChallengeBody: React.FC<Props> = ({ children }: Props) => {
  return <div className='inline-challenge-body'>{children}</div>;
};

export default InlineChallengeBody;
