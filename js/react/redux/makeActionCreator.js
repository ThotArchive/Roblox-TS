export default function makeActionCreator(type, ...argNames) {
  return (...args) => ({
    type,
    ...argNames.reduce(
      (allArgs, argName, argIdx) =>
        Object.assign(allArgs, {
          [argName]: args[argIdx]
        }),
      {}
    )
  });
}
