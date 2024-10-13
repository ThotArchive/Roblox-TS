import React from 'react';
import { Modal } from 'react-style-guide';

export enum HeaderButtonType {
  BACK = 'BACK',
  CLOSE = 'CLOSE',
  HIDDEN = 'HIDDEN'
}

const renderHeaderButton = (
  buttonType: HeaderButtonType,
  buttonAction: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  buttonEnabled: boolean
) => {
  switch (buttonType) {
    case HeaderButtonType.BACK:
      return (
        <button
          type='button'
          className='modal-modern-header-button'
          onClick={buttonAction}
          disabled={!buttonEnabled}>
          <span className='icon-back' />
        </button>
      );
    case HeaderButtonType.CLOSE:
      return (
        <button
          type='button'
          className='modal-modern-header-button'
          onClick={buttonAction}
          disabled={!buttonEnabled}>
          <span className='icon-close' />
        </button>
      );
    case HeaderButtonType.HIDDEN:
    default:
      return <div />;
  }
};

type Props = {
  headerText: string;
  buttonType: HeaderButtonType;
  buttonAction: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  buttonEnabled: boolean;
  headerInfo: JSX.Element | null;
};

/**
 * A modal header with header text and an action button.
 */
export const FragmentModalHeader: React.FC<Props> = ({
  headerText,
  buttonType,
  buttonAction,
  buttonEnabled,
  headerInfo
}: Props) => {
  return (
    <Modal.Header useBaseBootstrapComponent>
      {renderHeaderButton(buttonType, buttonAction, buttonEnabled)}
      <Modal.Title>{headerText}</Modal.Title>
      <div className='modal-modern-header-info'>{headerInfo}</div>
    </Modal.Header>
  );
};
