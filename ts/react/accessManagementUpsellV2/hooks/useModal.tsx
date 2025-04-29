import React, { useMemo, useState } from 'react';
import { Button, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import ClassNames from 'classnames';

interface IModalService {
  open: () => void;
  close: () => void;
}

type TCreateSettingsModal = (props: {
  translate: TranslateFunction;
  title: string;
  body: React.ReactNode;
  actionButtonTranslateKey?: string;
  neutralButtonTranslateKey?: string;
  footer?: React.ReactNode;
  size?: string;
  disableActionButton?: boolean;
  disabledNeutralButton?: boolean;
  onAction?: () => void;
  onHide?: () => void;
  onNeutral?: () => void;
  dualActionButton?: boolean;
}) => [JSX.Element, IModalService];

const useModal: TCreateSettingsModal = ({
  translate,
  title,
  body,
  actionButtonTranslateKey = '',
  neutralButtonTranslateKey,
  footer,
  size = 'sm',
  onAction,
  disableActionButton,
  disabledNeutralButton,
  dualActionButton = false,
  onHide = () => {
    // do nothing by default
  },
  onNeutral // use this to create a different effect than onHide callback.
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const buttonClassNames = ClassNames({
    'modal-half-width-button': neutralButtonTranslateKey,
    'modal-full-width-button': !neutralButtonTranslateKey
  });

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHide();
      }}
      backdrop
      className='access-management-upsell-inner-modal'
      size={size}
      aria-labelledby='access-management-upsell-inner-modal-title'
      scrollable
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='access-management-upsell-inner-modal-title-container'>
          <Modal.Title id='access-management-upsell-inner-modal-title'>{title}</Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          onClick={() => {
            modalService.close();
            onHide();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        {actionButtonTranslateKey && (
          <Button
            className={buttonClassNames}
            variant={Button.variants.primary}
            size={Button.sizes.medium}
            isDisabled={disableActionButton}
            onClick={() => {
              onAction?.();
              modalService.close();
            }}>
            {translate(actionButtonTranslateKey)}
          </Button>
        )}
        {neutralButtonTranslateKey && (
          <Button
            className={buttonClassNames}
            variant={dualActionButton ? Button.variants.primary : Button.variants.secondary}
            size={Button.sizes.medium}
            isDisabled={disabledNeutralButton}
            onClick={() => {
              onNeutral?.();
              modalService.close();
            }}>
            {translate(neutralButtonTranslateKey)}
          </Button>
        )}
      </Modal.Footer>
      {footer && (
        <div className='text-footer access-management-upsell-inner-modal-text-footer border-top'>
          {footer}
        </div>
      )}
    </Modal>
  );

  return [modal, modalService];
};

export default useModal;
