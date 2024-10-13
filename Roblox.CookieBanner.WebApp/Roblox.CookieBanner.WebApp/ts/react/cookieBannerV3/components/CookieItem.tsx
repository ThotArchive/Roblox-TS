import React from 'react';

const CookieItem = ({
  cookieName,
  description
}: {
  cookieName: string;
  description: string;
}): JSX.Element => {
  return (
    <div className='cookie-item'>
      <p className='cookie-name font-body text'>{cookieName}</p>
      <p className='cookie-description font-footer'>{description}</p>
    </div>
  );
};

export default CookieItem;
