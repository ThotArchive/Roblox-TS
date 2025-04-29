/* eslint-disable no-console */
const log = (error, info) => {
  console.warn("The following exception has been caught with the captured component stack:");
  console.group();
  console.info(`${error}`);
  console.info(`${info.componentStack}`);
  console.groupEnd();
};

export default { log };
