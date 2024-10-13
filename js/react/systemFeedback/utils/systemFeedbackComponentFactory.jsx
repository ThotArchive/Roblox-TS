import React from 'react';
import PropTypes from 'prop-types';
import { connect, Provider } from 'react-redux';
import { accessibility } from 'core-utilities';
import SystemFeedback from '../components/SystemFeedback';
import hideBanner from '../actions/hideBanner';

const mapStateToProps = ({ bannerText, bannerType, showBanner, showCloseButton }) => ({
  bannerText,
  bannerType,
  showBanner,
  showCloseButton
});

const mapDispatchToProps = dispatch => ({
  onCloseClick(e) {
    e.preventDefault();

    dispatch(hideBanner());
  },
  onCloseKeyDown: accessibility.createKeyboardEventHandler(
    () => {
      dispatch(hideBanner());
    },
    ['Escape'],
    true
  )
});

const ConnectedSystemFeedback = connect(mapStateToProps, mapDispatchToProps)(SystemFeedback);

const create = store => {
  const options = {};

  function SystemFeedbackComponent({
    successMessage,
    loadingMessage,
    warningMessage,
    timeoutShow,
    timeoutHide
  }) {
    Object.assign(options, {
      successMessage,
      loadingMessage,
      warningMessage,
      timeoutShow,
      timeoutHide
    });
    return (
      <Provider store={store}>
        <ConnectedSystemFeedback />
      </Provider>
    );
  }

  SystemFeedbackComponent.defaultProps = {
    successMessage: '',
    loadingMessage: '',
    warningMessage: '',
    timeoutShow: 200,
    // Default suggested by Andrea:
    // 1s plus 0.5s for each word
    timeoutHide: message => 1000 + 500 * message.split(/(\s+)/).length
  };

  SystemFeedbackComponent.propTypes = {
    successMessage: PropTypes.string,
    loadingMessage: PropTypes.string,
    warningMessage: PropTypes.string,
    timeoutShow: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    timeoutHide: PropTypes.oneOfType([PropTypes.number, PropTypes.func])
  };

  return [SystemFeedbackComponent, () => options];
};

export default { create };
