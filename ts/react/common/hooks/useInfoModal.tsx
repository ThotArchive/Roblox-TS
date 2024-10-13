import React, { useMemo, useState } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import ClassNames from 'classnames';

type TInfoModal = (props: {
  translate: TranslateFunction;
  titleTranslationKey: string;
  bodyTranslationKey: string;
  actionButtonTextTranslationKey: string;
  onAction?: () => void;
  neutralButtonTextTranslationKey?: string;
  onNeutral?: () => void;
  closeable?: boolean;
}) => [JSX.Element, IModalService];

const useInfoModal: TInfoModal = ({
  translate,
  titleTranslationKey,
  bodyTranslationKey,
  actionButtonTextTranslationKey,
  onAction,
  neutralButtonTextTranslationKey,
  onNeutral,
  closeable = true
}): [JSX.Element, IModalService] => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const btnClass = ClassNames({
    'info-modal-half-width-button': neutralButtonTextTranslationKey,
    'info-modal-full-width-button': !neutralButtonTextTranslationKey
  });
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
      }}
      backdrop={closeable ? true : 'static'}
      keyboard={closeable}
      className='parental-consent-modal'
      size='sm'
      aria-labelledby='info-modal-title'
      scrollable
      centered
      closeable={closeable}>
      <Modal.Header useBaseBootstrapComponent>
        <div>
          <Modal.Title id='info-modal-title'>{translate(titleTranslationKey)}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>{translate(bodyTranslationKey)}</Modal.Body>
      <Modal.Footer>
        <Button
          className={btnClass}
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          onClick={() => {
            onAction?.();
            modalService.close();
          }}>
          {translate(actionButtonTextTranslationKey)}
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {neutralButtonTextTranslationKey && (
          <Button
            className={btnClass}
            variant={Button.variants.secondary}
            size={Button.sizes.medium}
            onClick={() => {
              onNeutral?.();
              modalService.close();
            }}>
            {translate(neutralButtonTextTranslationKey)}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );

  return [modal, modalService];
};

export default useInfoModal;
