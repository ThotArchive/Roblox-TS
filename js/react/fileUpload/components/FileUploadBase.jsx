import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { accessibility } from 'core-utilities';
import allowedEffectTypes from '../constants/allowedEffectTypes';

function FileUploadBase({ className, onChange, children, ...otherProps }) {
  const inputRef = useRef(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onKeyDown = accessibility.createKeyboardEventHandler(
    onClick,
    [/** for IE 11 */ 'Spacebar', ' ', 'Enter'],
    true
  );

  const onFileChange = e => {
    const { target } = e;
    if (onChange) {
      onChange(target.files);
    }

    /**
     * Clear the stored files for the following reasons:
     * 1) This core component is meant to be stateless (already true for drag and drop case),
     * hence it should reset it self after handling over the files data.
     * 2) The browser's file input will re-fire the change event iff a file with a different name
     * is re-selected. Thus if we don't actually reset the input, it will cause issues for case
     * where the consumer need to allow "deletion".
     *
     * If you find that you need to expose more info (i.e. info for the event object) to the consumer,
     * please consider re-design the widget instead of approaches like pass it as an additional argument to
     * this.props.onChange.
     */
    target.value = null;
  };

  const onDrop = e => {
    e.preventDefault();
    const {
      dataTransfer: { files }
    } = e;

    if (onChange) {
      onChange(files);
    }
  };

  const onDragOverOrEnter = e => {
    e.preventDefault();
    e.dataTransfer.effectAllowed = allowedEffectTypes.copy;
  };

  const fileUploadBaseClasses = classNames(className, 'file-upload', 'cursor-pointer');
  const userInterface = children ? children(onClick, onKeyDown, onDrop, onDragOverOrEnter) : null;
  return (
    <div className={fileUploadBaseClasses}>
      <div className='file-upload-container border'>
        {userInterface}
        <input
          {...otherProps}
          ref={inputRef}
          type='file'
          className='hidden file-upload-input'
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}

FileUploadBase.defaultProps = {
  className: null,
  children: null,
  onChange: null
};

FileUploadBase.propTypes = {
  className: PropTypes.string,
  children: PropTypes.func,
  onChange: PropTypes.func
};

export default FileUploadBase;
