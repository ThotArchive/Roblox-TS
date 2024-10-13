import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';
import layoutConstants from '../constants/layoutConstants';

const { mainContentId } = layoutConstants;

function SkipToMainContent({ translate }) {
  const mainContentElement = document.getElementById(mainContentId);
  return (
    <Button
      id='skip-to-main-content'
      size={Button.sizes.extraSmall}
      variant={Button.variants.primary}
      onClick={() => mainContentElement.focus()}>
      {translate('Action.SkipToMainContent') || 'Skip to main content'}
    </Button>
  );
}

SkipToMainContent.propTypes = {
  translate: PropTypes.func.isRequired
};

export default SkipToMainContent;
