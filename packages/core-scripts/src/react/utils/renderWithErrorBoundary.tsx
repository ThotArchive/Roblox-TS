import { ErrorBoundary } from "@sentry/react";
import { render } from "react-dom";

const renderWithErrorBoundary = (
  element: React.ReactNode,
  container: Element | Document | DocumentFragment | null,
  callback?: () => void,
): void => {
  render(<ErrorBoundary>{element}</ErrorBoundary>, container, callback);
};

export default renderWithErrorBoundary;
