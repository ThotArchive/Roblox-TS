export default (type, ...argNames) =>
  (...args) => ({
    type,
    ...argNames.reduce(
      (allArgs, argName, argIdx) =>
        Object.assign(allArgs, {
          [argName]: args[argIdx],
        }),
      {},
    ),
  });
