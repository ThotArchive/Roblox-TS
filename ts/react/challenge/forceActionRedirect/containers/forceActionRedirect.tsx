import React from 'react';
import { Modal } from 'react-style-guide';
import InlineChallenge from '../../../common/inlineChallenge';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import { InlineChallengeFooter } from '../../../common/inlineChallengeFooter';
import { FooterButtonConfig, FragmentModalFooter } from '../../../common/modalFooter';
import { FragmentModalHeader, HeaderButtonType } from '../../../common/modalHeader';
import { ACCOUNT_SETTINGS_SECURITY_PATH } from '../app.config';
import useForceActionRedirectContext from '../hooks/useForceActionRedirectContext';
import { ForceActionRedirectActionType } from '../store/action';

/**
 * A container element for the Force Action modal UI.
 */
const ForceActionRedirect: React.FC = () => {
  const {
    state: {
      renderInline,
      redirectURLSignifier,
      resources,
      onModalChallengeAbandoned,
      isModalVisible
    },
    dispatch
  } = useForceActionRedirectContext();

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: ForceActionRedirectActionType.HIDE_MODAL_CHALLENGE
    });
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: ForceActionRedirectActionType.SHOW_MODAL_CHALLENGE
        })
      );
    }
  };

  /*
   * Render Properties
   */
  const positiveButton: FooterButtonConfig = {
    content: resources.Action,
    label: resources.Action,
    enabled: true,
    action: () => {
      const accountSettingsUrl = ACCOUNT_SETTINGS_SECURITY_PATH + redirectURLSignifier;
      // Checks if page is loaded in an iframe.
      if (window.top && window.top !== window.self) {
        // For Barista we want to load the account settings URL in the topmost frame.
        window.top.location.href = accountSettingsUrl;
      } else {
        // The `_self` target opens the redirect URL in the current page.
        window.open(accountSettingsUrl, '_self');
      }
    }
  };

  /*
   * Rendering Helpers
   */

  const getPageContent = () => {
    const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
    const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
    const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';

    return (
      <React.Fragment>
        <BodyElement>
          <div className={lockIconClassName} />
          <p>{resources.Body}</p>
        </BodyElement>
        <FooterElement positiveButton={positiveButton} negativeButton={null} />
      </React.Fragment>
    );
  };

  /*
   * Component Markup
   */

  return renderInline ? (
    <InlineChallenge titleText={resources.Header}>{getPageContent()}</InlineChallenge>
  ) : (
    <Modal className='modal-modern' show={isModalVisible} onHide={closeModal} backdrop='static'>
      <FragmentModalHeader
        headerText={resources.Header}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled
        headerInfo={null}
      />
      {getPageContent()}
    </Modal>
  );
};

export default ForceActionRedirect;
