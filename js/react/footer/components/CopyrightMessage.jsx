import React from 'react';
import PropTypes from 'prop-types';

function CopyrightMessage({ translate }) {
  const currentYear = new Date().getFullYear();
  return (
    <p className='text-footer footer-note'>
      {translate('Description.CopyRightMessageDynamicYear', { copyrightYear: currentYear })}
    </p>
  );
}

CopyrightMessage.propTypes = {
  translate: PropTypes.func.isRequired
};

export default CopyrightMessage;
