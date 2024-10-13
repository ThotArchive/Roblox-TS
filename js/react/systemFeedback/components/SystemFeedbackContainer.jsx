import React from 'react';
import PropTypes from 'prop-types';
import { accessibility } from 'core-utilities';
import BANNER_TYPES from '../constants/bannerTypes';
import SystemFeedback from './SystemFeedback';
import systemFeedbackUtil from '../utils/systemFeedbackUtil';

class SystemFeedbackContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showBanner: false,
      bannerText: null,
      bannerType: null
    };

    this.timeoutId = null;
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleCloseKeyPress = accessibility
      .createKeyboardEventHandler(this._hideBanner, ['Escape'], true)
      .bind(this);
  }

  componentWillUnmount() {
    this._resetTimer();
  }

  handleCloseClick(e) {
    e.preventDefault();
    this._hideBanner();
  }

  _resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  _showBanner(type, message, overrideTimeoutShow, overrideTimeoutHide) {
    this._resetTimer();

    const {
      successMessage,
      loadingMessage,
      warningMessage,
      timeoutShow: defaultTimeoutShow,
      timeoutHide: defaultTimeoutHide
    } = this.props;

    const fallbackOptions = {
      successMessage,
      loadingMessage,
      warningMessage,
      timeoutShow: defaultTimeoutShow,
      timeoutHide: defaultTimeoutHide
    };
    const {
      bannerText,
      bannerType,
      timeoutShow,
      timeoutHide
    } = systemFeedbackUtil.buildBannerOptions(
      type,
      message,
      overrideTimeoutShow,
      overrideTimeoutHide,
      fallbackOptions
    );

    if (timeoutShow !== null) {
      this.timeoutId = setTimeout(() => {
        this.setState({
          showBanner: true,
          bannerText,
          bannerType
        });

        if (timeoutHide !== null) {
          this.timeoutId = setTimeout(() => {
            this._hideBanner();
          }, timeoutHide);
        }
      }, timeoutShow);
    }
  }

  _hideBanner() {
    this._resetTimer();

    this.setState({
      showBanner: false
    });
  }

  loading(...configs) {
    this._showBanner(BANNER_TYPES.loading, ...configs);
  }

  success(...configs) {
    this._showBanner(BANNER_TYPES.success, ...configs);
  }

  warning(...configs) {
    this._showBanner(BANNER_TYPES.warning, ...configs);
  }

  clear() {
    this._hideBanner();
  }

  render() {
    const { bannerType, bannerText, showBanner } = this.state;
    return (
      <SystemFeedback
        bannerType={bannerType}
        bannerText={bannerText}
        showBanner={showBanner}
        showCloseButton={bannerType === BANNER_TYPES.warning}
        onCloseClick={this.handleCloseClick}
        onCloseKeyDown={this.handleCloseKeyDown}
      />
    );
  }
}

SystemFeedbackContainer.defaultProps = {
  successMessage: '',
  loadingMessage: '',
  warningMessage: '',
  timeoutShow: 200,
  // Default suggested by Andrea:
  // 1s plus 0.5s for each word
  timeoutHide: message => 1000 + 500 * message.split(/(\s+)/).length
};

SystemFeedbackContainer.propTypes = {
  successMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  warningMessage: PropTypes.string,
  timeoutShow: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  timeoutHide: PropTypes.oneOfType([PropTypes.number, PropTypes.func])
};

export default SystemFeedbackContainer;
