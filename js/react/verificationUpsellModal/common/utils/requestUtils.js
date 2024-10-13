const getErrorCodeFromRequestError = err => {
  const errors = err?.data?.errors;
  return errors && errors[0] && errors[0].code;
};
export { getErrorCodeFromRequestError as default };
