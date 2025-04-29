import ControlledFormField from "./ControlledFormField";

function TextareaFormField(props) {
  return (
    <ControlledFormField {...props}>
      {({ id, className, name, value, onChange, ...otherProps }) => (
        <textarea
          {...otherProps}
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

export default TextareaFormField;
