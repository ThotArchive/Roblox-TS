/**
 * Pauses the current thread of execution for the given number of milliseconds.
 */
const sleep = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(undefined), milliseconds));

export default sleep;
