import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { translation } from './app.config';
import PhoneUpsellModalContainer from './phoneUpsellModal/container/PhoneUpsellModalContainer';
import { PhoneUpsellModalStateProvider } from './phoneUpsellModal/stores/PhoneUpsellModalStoreContext';

function PhoneUpsellApp({
  translate,
  onClose,
  origin,
  existingPhoneNumber,
  addPhoneAlwaysShowLegalText,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess,
  renderInWebview
}) {
  return (
    <PhoneUpsellModalStateProvider>
      <PhoneUpsellModalContainer
        translate={translate}
        onClose={onClose}
        origin={origin}
        existingPhoneNumber={existingPhoneNumber}
        addPhoneAlwaysShowLegalText={addPhoneAlwaysShowLegalText}
        addPhoneRequireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
        addPhoneHeadingKey={addPhoneHeadingKey}
        addPhoneDescriptionKey={addPhoneDescriptionKey}
        addPhoneLegalTextKey={addPhoneLegalTextKey}
        addPhoneButtonKey={addPhoneButtonKey}
        beforeSuccess={beforeSuccess}
        renderInWebview={renderInWebview}
      />
    </PhoneUpsellModalStateProvider>
  );
}

PhoneUpsellApp.propTypes = {
  translate: PropTypes.func.isRequired,
  origin: PropTypes.string,
  onClose: PropTypes.func,
  existingPhoneNumber: PropTypes.string,
  addPhoneAlwaysShowLegalText: PropTypes.bool,
  addPhoneRequireLegalTextCheckbox: PropTypes.bool,
  addPhoneHeadingKey: PropTypes.string,
  addPhoneDescriptionKey: PropTypes.string,
  addPhoneLegalTextKey: PropTypes.string,
  addPhoneButtonKey: PropTypes.string,
  beforeSuccess: PropTypes.func,
  renderInWebview: PropTypes.bool
};

PhoneUpsellApp.defaultProps = {
  origin: undefined,
  onClose: () => null,
  existingPhoneNumber: null,
  addPhoneAlwaysShowLegalText: undefined, // default is set in AddPhoneNumber.jsx
  addPhoneRequireLegalTextCheckbox: undefined,
  addPhoneHeadingKey: undefined,
  addPhoneDescriptionKey: undefined,
  addPhoneLegalTextKey: undefined,
  addPhoneButtonKey: undefined,
  beforeSuccess: undefined, // default set in PhoneUpsellModalContainer.jsx
  renderInWebview: undefined // default set in PhoneUpsellModalContainer.jsx
};

export default withTranslations(PhoneUpsellApp, translation);
