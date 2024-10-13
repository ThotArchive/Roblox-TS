// TL;DR properly set display name of a HOC generated component to ease debugging
// see https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging for details

const getWrappedComponentName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component';

const getDisplayName = (WrappedComponent, debuggingNamePrefix) =>
  `${debuggingNamePrefix}(${getWrappedComponentName(WrappedComponent)})`;

/* Usage:
 * // define your own HOC function,
 * // the WrappedComponent *NEEDS* to be the first argument of your function
 * // you can have zero or more config arguments follows the WrappedComponent
 * function withMyHOC(WrappedComponent, config) { // implementation... }
 *
 * // wrap your function with this utility before export and give it a debugging prefix
 * export default ammendHOCDebuggingInfo(myHOC, 'withMyHOC');
 */
const ammendHOCDebuggingInfo = (customHOCFunction, debuggingNamePrefix = 'withHOC') => (
  WrappedComponent,
  ...additionalConfigs
) => {
  const generatedComponent = customHOCFunction(WrappedComponent, ...additionalConfigs);
  generatedComponent.displayName = getDisplayName(WrappedComponent, debuggingNamePrefix);
  return generatedComponent;
};

export default ammendHOCDebuggingInfo;
