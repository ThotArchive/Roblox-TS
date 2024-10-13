import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { minimumAge } from '../constants/viewConstants';
import { postShowOverlay } from '../services/voiceChatService';

function ViewTemplate({
  translate,
  onHide,
  heading,
  icon,
  bodyText,
  errorState,
  footerText,
  userEmail,
  daysUntilNextVerification,
  canClose,
  buttonStack,
  includeLink,
  displayCheckbox
}) {
  const [checked, setChecked] = useState(false);
  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div className='email-upsell-title-container'>
          {canClose && (
            <button type='button' className='email-upsell-title-button' onClick={onHide}>
              <span className='close icon-close' />
            </button>
          )}
          <Modal.Title id='contained-modal-title-vcenter'>{translate(heading)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        {icon && <div className={icon} />}
        <ul className={errorState ? 'content-list error-text' : 'content-list'}>
          {includeLink
            ? bodyText.map(text => (
                <li
                  dangerouslySetInnerHTML={{
                    __html: translate(text, {
                      spanStart: "<a class='text-link' href='/info/privacy'>",
                      spanEnd: '</a>',
                      boldStart: '<b>',
                      boldEnd: '</b>'
                    })
                  }}
                />
              ))
            : bodyText.map(text => (
                <li>
                  {translate(text, {
                    age: minimumAge,
                    email: userEmail,
                    days: daysUntilNextVerification
                  })}
                </li>
              ))}
        </ul>
        {displayCheckbox && (
          <div className='checkbox checkbox-container'>
            <input
              id='isShowOverlayChecked'
              type='checkbox'
              checked={checked}
              onClick={() => {
                setChecked(!checked);
                postShowOverlay(checked);
              }}
            />
            <label htmlFor='isShowOverlayChecked'>{translate('Label.DontShowAgain')}</label>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {footerText && (
          <p className='small'>
            <b>{translate(footerText)}</b>
          </p>
        )}
        {buttonStack.map(button => {
          const isPrimaryButton = button.variant === Button.variants.primary;
          return (
            <span key={button.text}>
              <Button
                className={classNames('button-stack-button', {
                  'primary-link': isPrimaryButton,
                  'secondary-link': !isPrimaryButton
                })}
                variant={button.variant}
                size={Button.sizes.medium}
                onClick={button.callback}>
                {translate(button.text)}
              </Button>
            </span>
          );
        })}
      </Modal.Footer>
    </React.Fragment>
  );
}

ViewTemplate.defaultProps = {
  errorState: false,
  footerText: null,
  userEmail: null,
  daysUntilNextVerification: 0,
  canClose: true,
  includeLink: false,
  displayCheckbox: false
};

ViewTemplate.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  heading: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  bodyText: PropTypes.arrayOf(PropTypes.string).isRequired,
  errorState: PropTypes.bool,
  footerText: PropTypes.string,
  userEmail: PropTypes.string,
  daysUntilNextVerification: PropTypes.number,
  canClose: PropTypes.bool,
  includeLink: PropTypes.bool,
  buttonStack: PropTypes.arrayOf(
    PropTypes.shape({
      variant: PropTypes.oneOf(Button.variants),
      text: PropTypes.string,
      callback: PropTypes.func
    })
  ).isRequired,
  displayCheckbox: PropTypes.bool
};

export default ViewTemplate;
