export const debounce = <T extends Array<unknown>>(
  func: (...args: T) => void,
  timeout = 300
): [(...args: T) => void, () => void] => {
  let timer: ReturnType<typeof setTimeout>;
  return [
    (...args: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    },
    () => {
      clearTimeout(timer);
    }
  ];
};

export default {
  debounce
};
