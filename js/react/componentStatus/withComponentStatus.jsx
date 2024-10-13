import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import errorBoundaryLogUtil from '../utils/errorBoundaryLogUtil';
import ammendHOCDebuggingInfo from '../utils/amendHOCDebuggingInfo';

function withComponentStatus(WrappedComponent) {
  class ComponentWithStatus extends React.Component {
    constructor(props) {
      super(props);

      const { showAppOnInit } = this.props;
      this.state = {
        isLoading: !showAppOnInit,
        hasError: false,
        errorState: null
      };

      this.onLoadStart = this.onLoadStart.bind(this);
      this.onLoadEnd = this.onLoadEnd.bind(this);
      this.onError = this.onError.bind(this);
    }

    // can take an argument: error
    static getDerivedStateFromError() {
      return {
        hasError: true,
        errorState: null
      };
    }

    componentDidCatch(error, info) {
      errorBoundaryLogUtil.log(error, info);
    }

    onLoadStart() {
      this.setState({
        isLoading: true
      });
    }

    onLoadEnd() {
      this.setState({
        isLoading: false
      });
    }

    onError(errorState) {
      this.setState({
        hasError: true,
        errorState
      });
    }

    render() {
      const { showAppOnInit, defaultMessage, errorStates, ...otherProps } = this.props;
      const { isLoading, hasError, errorState } = this.state;

      let statusContent;
      let appContent;
      if (hasError) {
        statusContent = (
          <h3>{errorStates[errorState] ? errorStates[errorState] : defaultMessage}</h3>
        );
      } else {
        statusContent = <span className='spinner spinner-default' />;
        appContent = (
          <WrappedComponent
            {...otherProps}
            isLoading={isLoading}
            hasError={hasError}
            errorState={errorState}
            onLoadStart={this.onLoadStart}
            onLoadEnd={this.onLoadEnd}
            onError={this.onError}
          />
        );
      }

      const hasStatus = hasError || isLoading;
      const statusContainerClass = classNames('component-status-container', {
        hidden: !hasStatus
      });
      const appContainerClass = classNames('component-container', {
        hidden: hasStatus
      });
      return (
        <div className='component-status'>
          <div className={statusContainerClass}>{statusContent}</div>
          <div className={appContainerClass}>{appContent}</div>
        </div>
      );
    }
  }

  ComponentWithStatus.defaultProps = {
    showAppOnInit: false,
    defaultMessage: '',
    errorStates: {}
  };

  ComponentWithStatus.propTypes = {
    showAppOnInit: PropTypes.bool,
    defaultMessage: PropTypes.string,
    errorStates: PropTypes.objectOf(PropTypes.string)
  };

  return ComponentWithStatus;
}

export default ammendHOCDebuggingInfo(withComponentStatus, 'withComponentStatus');
