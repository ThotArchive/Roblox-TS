/**
 * A functional-programming-inspired type that holds the value or nothing
 * This paradigm is useful because optionality is often encoded by falsey
 * values in Javascript, and this makes the intention explicit.
 *
 * It also makes conditional logic on nullability/undefined-ness easier to
 * reason about, as mapping only affects happy paths, and defaults can be
 * explicitly supplied.
 *
 * `of` lifts non-Optional types into Optional types if they previously
 * implemented `null | undefined`.
 */
export type Optional<T> =
  | {
      hasValue: true;
      readonly value: T;
    }
  | {
      hasValue: false;
    };

// We're being intentional that some falsey values in Javascript are valid
// values, so not including every falsey value here.
type Missing = undefined | null;

const of = <T>(value: T | Missing): Optional<T> => {
  if (value === null || value === undefined) return { hasValue: false };
  return { hasValue: true, value };
};

const empty = <T>(): Optional<T> => ({ hasValue: false });

const map = <T, R>(maybeValue: Optional<T>, mapper: (value: T) => R): Optional<R> => {
  return maybeValue.hasValue ? Optional.of(mapper(maybeValue.value)) : empty();
};

const orElse = <T>(maybeValue: Optional<T>, elseValue: T): Optional<T> => {
  return maybeValue.hasValue ? maybeValue : Optional.of(elseValue);
};

export const Optional = { of, empty, map, orElse };
