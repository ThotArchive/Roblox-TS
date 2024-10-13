const redactEmailAddress = email => {
  const atCharIndex = email.indexOf('@');
  const firstChar = email.substring(0, 1);
  // redacted emails are shaped as a*****@gmail.com
  const redactedEmail = `${firstChar}*****${email.substring(atCharIndex)}`;
  return redactedEmail;
};

export { redactEmailAddress as default };
