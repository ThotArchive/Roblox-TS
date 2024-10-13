export type TVisibilityCallback = (visible: boolean) => void;

export type TObserveVisibilityOptions = {
  element: HTMLElement;
  threshold?: number;
};

export type TObserveChildrenVisibilityOptions = {
  elements: Element[];
  threshold?: number;
};

export function observeVisibility(
  options: TObserveVisibilityOptions,
  callback: TVisibilityCallback
): VoidFunction {
  const { element, threshold } = options;
  try {
    const intersectionObserver = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        callback(entry?.isIntersecting);
      },
      { threshold }
    );

    intersectionObserver.observe(element);
    return () => intersectionObserver.disconnect();
  } catch (_) {
    // Ignore cases where IntersectionObserver does not exist in ancient browsers
    // We could write our own implementation based on window.scroll or use a polyfill in the future if needed
  }

  return () => undefined;
}

export function observeChildrenVisibility(
  options: TObserveChildrenVisibilityOptions,
  callback: IntersectionObserverCallback
): VoidFunction {
  const { elements, threshold } = options;
  try {
    const intersectionObserver = new window.IntersectionObserver(callback, { threshold });

    elements.forEach(el => {
      intersectionObserver.observe(el);
    });
    return () => intersectionObserver.disconnect();
  } catch (_) {
    // Ignore cases where IntersectionObserver does not exist in ancient browsers
    // We could write our own implementation based on window.scroll or use a polyfill in the future if needed
  }

  return () => undefined;
}

export default {
  observeVisibility,
  observeChildrenVisibility
};
