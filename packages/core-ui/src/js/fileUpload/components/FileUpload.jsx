import React from "react";
import PropTypes from "prop-types";
import FileUploadBase from "./FileUploadBase";
import fileTypes from "../constants/fileTypes";

// TODO: old, migrated code
// eslint-disable-next-line react/display-name
const FileUpload = React.forwardRef(({ instructionText, onChange, ...otherProps }, ref) => {
  const instruction = instructionText ? (
    <div className="file-upload-instruction">
      <span className="text-default">{instructionText}</span>
    </div>
  ) : null;
  return (
    <FileUploadBase {...otherProps} onChange={onChange}>
      {(onClick, onKeyDown, onDrop, onDragOverOrEnter) => (
        <div
          ref={ref}
          className="file-upload-dropzone"
          role="button"
          tabIndex="0"
          onClick={onClick}
          onKeyDown={onKeyDown}
          onDrop={onDrop}
          onDragOver={onDragOverOrEnter}
          onDragEnter={onDragOverOrEnter}
        >
          <div className="file-upload-icon">
            <span className="icon-additem" />
          </div>
          {instruction}
        </div>
      )}
    </FileUploadBase>
  );
});

FileUpload.defaultProps = {
  instructionText: null,
  onChange: null,
};

FileUpload.propTypes = {
  instructionText: PropTypes.string,
  onChange: PropTypes.func,
};

FileUpload.fileTypes = fileTypes;

export default FileUpload;
