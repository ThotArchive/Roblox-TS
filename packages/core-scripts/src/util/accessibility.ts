import { SyntheticEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Generic utility factory method for creating event handler
 *
 * @param fn the callback function to be executed if the condition is met
 * @param predicate the function that decides if the callback should be executed
 * @param preventDefault whether event.preventDefault should be called
 * @param stopPropagation whether event.stopPropagation should be called
 */
const createEventHandler =
  (
    fn: () => void,
    predicate: (event: Event | SyntheticEvent) => boolean,
    preventDefault = false,
    stopPropagation = false,
  ): ((event: Event | SyntheticEvent) => void) =>
  (event: Event | SyntheticEvent): void => {
    if (predicate(event)) {
      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      fn();
    }
  };

/** We also need to support React's synthetic event system... */
const isKeyboardEvent = (event: Event | SyntheticEvent): boolean => {
  if (event instanceof Event) {
    return event instanceof KeyboardEvent;
  }
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return event.nativeEvent && event.nativeEvent instanceof KeyboardEvent;
};

/**
 * Create a keyboard event handler that execute the given function
 * when the key is pressed matched one of the given keys
 *
 * @param fn the callback function to be executed if the specified key is pressed
 * @param keys the list of keys to listen for
 * @param preventDefault whether event.preventDefault should be called
 * @param stopPropagation whether event.stopPropagation should be called
 */
export const createKeyboardEventHandler = (
  fn: () => void,
  keys: string[],
  preventDefault?: boolean,
  stopPropagation?: boolean,
): ((event: Event | SyntheticEvent) => void) =>
  createEventHandler(
    fn,
    event => {
      if (!isKeyboardEvent(event)) {
        // eslint-disable-next-line no-console
        console.info(
          "The event passed in is not a keyboard event, are you using the handler in the wrong place?",
        );
        return false;
      }
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return keys.includes((event as KeyboardEvent | ReactKeyboardEvent).key);
    },
    preventDefault,
    stopPropagation,
  );
