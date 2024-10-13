import React from 'react';
import { Modal } from 'react-style-guide';
import { FragmentModalHeader, HeaderButtonType } from './modalHeader';
import InlineChallengeBody from './inlineChallengeBody';
import { FooterButtonConfig, FragmentModalFooter } from './modalFooter';
import { InlineChallengeFooter, InlineFooterButtonConfig } from './inlineChallengeFooter';
import InlineChallenge from './inlineChallenge';

type Props = {
  renderInline: boolean;
  isConfirmationModalVisible: boolean;
  confirmAbandonLabel: string;
  rejectAbandonLabel: string;
  abandonConfirmationTitle: string;
  abandonConfirmationDescription: string;
  handleContinue: () => void | Promise<void>;
  handleConfirmAbandon: () => void | Promise<void>;
};

const getPageContent = (
  renderInline: boolean,
  abandonConfirmationBody: string,
  continueButton: InlineFooterButtonConfig,
  abandonButton: InlineFooterButtonConfig | null
) => {
  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
  return (
    <React.Fragment>
      <BodyElement>
        <p>{abandonConfirmationBody}</p>
      </BodyElement>
      <FooterElement positiveButton={continueButton} negativeButton={abandonButton} />
    </React.Fragment>
  );
};

const QuitVerificationConfirmation: React.FC<Props> = ({
  renderInline,
  confirmAbandonLabel,
  rejectAbandonLabel,
  abandonConfirmationTitle,
  abandonConfirmationDescription,
  isConfirmationModalVisible,
  handleContinue,
  handleConfirmAbandon
}: Props) => {
  const abandonButton: FooterButtonConfig = {
    content: rejectAbandonLabel,
    label: rejectAbandonLabel,
    enabled: true,
    action: handleContinue
  };

  const continueButton: FooterButtonConfig = {
    content: confirmAbandonLabel,
    label: confirmAbandonLabel,
    enabled: true,
    action: handleConfirmAbandon
  };

  return (
    <React.Fragment>
      {renderInline ? (
        <InlineChallenge titleText={abandonConfirmationTitle}>
          {getPageContent(
            renderInline,
            abandonConfirmationDescription,
            continueButton,
            abandonButton
          )}
        </InlineChallenge>
      ) : (
        <Modal
          className='modal-modern'
          show={isConfirmationModalVisible}
          onHide={handleConfirmAbandon}
          backdrop='static'>
          <FragmentModalHeader
            headerText={abandonConfirmationTitle}
            buttonType={HeaderButtonType.CLOSE}
            buttonAction={handleConfirmAbandon}
            buttonEnabled
            headerInfo={null}
          />
          {getPageContent(
            renderInline,
            abandonConfirmationDescription,
            continueButton,
            abandonButton
          )}
        </Modal>
      )}
    </React.Fragment>
  );
};

export default QuitVerificationConfirmation;
