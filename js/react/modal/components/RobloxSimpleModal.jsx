import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Button from '../../button/components/Button';
import Modal from './RobloxModal';
import ModalHeader from './RobloxModalHeader';
import ModalBody from './RobloxModalBody';
import ModalFooter from './RobloxModalFooter';
import Loading from '../../loaders/components/Loading';

// The following class comes with react bootstrap implementation:
// modal-header, modal-title, modal-body, modal-footer so existing css will still work
// but do be careful if we want to switch the underlying implementation
function RobloxSimpleModal({
  title,
  body,
  actionButtonShow,
  actionButtonVariant,
  actionButtonText,
  neutralButtonText,
  footerText,
  imageUrl,
  thumbnail,
  show,
  onAction,
  onNeutral,
  onClose,
  loading,
  disableActionButton,
  closeable,
  size,
  ...otherProps
}) {
  const actionButtonClass = ClassNames('modal-button', {
    disabled: disableActionButton
  });
  return (
    <Modal
      {...otherProps}
      show={show}
      onHide={onNeutral || onClose}
      dialogClassName='modal-window'
      animation={false}
      keyboard={closeable}
      backdrop={closeable ? true : 'static'}
      size={size}>
      {/* Modal's onHide will be propagated to here as onClose */}
      <ModalHeader title={title} showCloseButton={closeable} onClose={onClose || onNeutral} />
      <ModalBody>
        {body}
        {imageUrl && !thumbnail && (
          <div className='img-container modal-image-container'>
            <img className='modal-thumb' src={imageUrl} alt='Modal Thumbnail' />
          </div>
        )}
        {thumbnail && (
          <div className='img-container modal-image-container'>
            <thumbnail.type
              {...thumbnail.props}
              {...{
                containerClass: 'modal-thumb'
              }}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div className='loading'>{loading && <Loading />}</div>
        {!loading && (
          <div className='modal-buttons'>
            {actionButtonShow && (
              <Button
                variant={actionButtonVariant}
                onClick={onAction}
                className={actionButtonClass}>
                {actionButtonText}
              </Button>
            )}
            <Button variant={Button.variants.control} onClick={onNeutral} className='modal-button'>
              {neutralButtonText}
            </Button>
          </div>
        )}
        {footerText && <div className='text-footer'>{footerText}</div>}
      </ModalFooter>
    </Modal>
  );
}

RobloxSimpleModal.defaultProps = {
  title: '',
  body: null,
  actionButtonShow: false,
  actionButtonVariant: Button.variants.primary,
  actionButtonText: '',
  footerText: '',
  neutralButtonText: '',
  imageUrl: null,
  thumbnail: null,
  show: false,
  onAction: null,
  onNeutral: null,
  onClose: null,
  disableActionButton: false,
  loading: false,
  closeable: true,
  size: 'sm'
};

RobloxSimpleModal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.node,
  actionButtonShow: PropTypes.bool,
  actionButtonVariant: PropTypes.string,
  actionButtonText: PropTypes.string,
  footerText: PropTypes.node,
  neutralButtonText: PropTypes.string,
  imageUrl: PropTypes.string,
  thumbnail: PropTypes.node,
  show: PropTypes.bool,
  onAction: PropTypes.func,
  onNeutral: PropTypes.func,
  onClose: PropTypes.func,
  disableActionButton: PropTypes.bool,
  loading: PropTypes.bool,
  closeable: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default RobloxSimpleModal;
