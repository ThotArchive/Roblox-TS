import ControlledFormField from "./ControlledFormField";

function FileFormField(props) {
  return (
    <ControlledFormField {...props}>
      {({ id, className, name, value, onChange, ...otherProps }) => (
        <input
          {...otherProps}
          type="file"
          id={id}
          className={className}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </ControlledFormField>
  );
}

export default FileFormField;
