import React, { useState } from 'react';
import configureWebApps from '../../../../ts/webAppsConfiguration/configuration';

function ConfigurationPanel() {
  const [feedback, setFeedback] = useState(null);
  const [isPanelMinimized, setPanelMinimized] = useState(false);
  const [adValue, setAdValue] = useState(configureWebApps.getADFromCookie());
  const instruction = 'Enter your AD for local development branch or master for master branch';
  const masterBranch = 'master';
  const setup = e => {
    let { value } = e.target;
    if (value !== adValue) {
      if (value.toLowerCase() === masterBranch) {
        value = '';
      }
      setAdValue(value);
      configureWebApps.setADInCookie(value);
      setFeedback(
        `The local development is point to ${value || masterBranch} now. Please reload web page`
      );
    }
  };
  const togglePanel = () => {
    setPanelMinimized(currentValue => !currentValue);
  };
  const placeHolder = adValue || 'AD username (e.g. brose)';
  return (
    <div
      className={`configure-webapps-container font-small ${isPanelMinimized ? 'minimized' : ''}`}>
      <div className='clearfix'>
        <button
          type='button'
          className='minimize-control font-bold'
          onClick={togglePanel}
          variant='secondary'
          size='xs'>
          {isPanelMinimized ? '-' : '+'}
        </button>
      </div>
      {!isPanelMinimized && (
        <React.Fragment>
          <p className='font-small'>{instruction}</p>{' '}
          <input
            id='webapp-component-suffix'
            className='form-control font-small input-field'
            name='webapp-component'
            placeholder={placeHolder}
            value={adValue}
            onChange={setup}
            onBlur={setup}
          />
          {feedback != null && <p className='font-small text-success'>{feedback}</p>}
        </React.Fragment>
      )}
    </div>
  );
}

ConfigurationPanel.propTypes = {};

export default ConfigurationPanel;
