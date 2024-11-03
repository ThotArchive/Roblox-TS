import { useState } from 'react';
import { debounce } from '../utils/helperUtils';

function useFocused(): [boolean, () => void, () => void] {
  const [isFocused, setIsFocused] = useState(false);

  const [setFocusDebounced, cancelSetFocusDebounced] = debounce(() => {
    setIsFocused(true);
  }, 100);

  const [setFocusLostDebounced, cancelSetFocusLostDebounced] = debounce(() => {
    setIsFocused(false);
  }, 100);

  const onFocus = () => {
    cancelSetFocusLostDebounced();
    setFocusDebounced();
  };

  const onFocusLost = () => {
    cancelSetFocusDebounced();
    setFocusLostDebounced();
  };

  return [isFocused, onFocus, onFocusLost];
}

export default useFocused;
