export const formatNumber = (
  value: number,
  locale?: string,
  style?: keyof Intl.NumberFormatOptions["style"],
  currency?: string,
): string => {
  try {
    return new Intl.NumberFormat(locale, { style, currency }).format(value);
  } catch {
    return value.toString();
  }
};

const oneThousand = 1000;
const tenThousand = 10000;
const oneMillion = 1000000;
const oneBillion = 1000000000;
const oneTrillion = 1000000000000;

export enum SuffixNames {
  withPlus = "withPlus",
  withoutPlus = "withoutPlus",
}

export const suffixes: Record<SuffixNames, string[]> = {
  withPlus: ["", "K+", "M+", "B+", "T+"],
  withoutPlus: ["", "K", "M", "B", "T"],
};

/*
 * Truncate number into without rounding, such as 567 => 567, 1,120 => 1,120 as default threshold, 33,890,133 => 33M+
 */
export const truncNumber = (
  value: number,
  abbreviationThreshold?: number,
  suffixType?: SuffixNames,
  digitsAfterDecimalPoint?: number,
): string => {
  const newValue = `${value}`;

  const threshold = abbreviationThreshold ?? tenThousand;

  if (value < threshold) {
    return formatNumber(value);
  }

  const suffix = suffixType ? suffixes[suffixType] : suffixes[SuffixNames.withPlus];
  let numOfTrimmedChars = 12;
  const power = Math.floor(Math.log(value) / Math.log(oneThousand));
  // Max index is `suffix.length - 1`.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const append = suffix[Math.min(power, suffix.length - 1)]!;

  if (value < oneMillion) {
    numOfTrimmedChars = 3;
  } else if (value < oneBillion) {
    numOfTrimmedChars = 6;
  } else if (value < oneTrillion) {
    numOfTrimmedChars = 9;
  }

  const beforeDecimalPlaceLength = newValue.length - numOfTrimmedChars;
  const afterDecimalPlace = !digitsAfterDecimalPoint
    ? ""
    : `.${newValue.substring(
        beforeDecimalPlaceLength,
        beforeDecimalPlaceLength + digitsAfterDecimalPoint,
      )}`;
  return newValue.substring(0, beforeDecimalPlaceLength) + afterDecimalPlace + append;
};

/*
 * Abbreviate number into at most 4 digits, such as 567 => 567, 1,120 => 1.1K, 33,890,133 => 33.9M
 * when isFormatEnabledUnderThreshold is true, means we will do only number format for the input instead of abbreviation
 */
export const abbreviateNumber = (
  value: number,
  suffixType?: SuffixNames,
  abbreviationThreshold?: number,
  isFormatEnabledUnderThreshold?: boolean,
): string => {
  let newValue = `${value}`;
  if (abbreviationThreshold && value < abbreviationThreshold) {
    return isFormatEnabledUnderThreshold ? formatNumber(value) : newValue;
  }
  const suffix = suffixType ? suffixes[suffixType] : suffixes[SuffixNames.withoutPlus];
  const maxSuffixNum = Math.ceil(newValue.length / 3);
  const maxDecPlaces = oneThousand ** maxSuffixNum;
  const maxShortValue = Math.round((value / maxDecPlaces) * 10) / 10;

  const minSuffixNum = maxSuffixNum - 1;
  const minDecPlaces = oneThousand ** minSuffixNum;
  const minShortValue = Math.round((value / minDecPlaces) * 10) / 10;

  if (minShortValue >= oneThousand) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newValue = maxShortValue.toString() + suffix[maxSuffixNum]!;
  } else {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newValue = minShortValue.toString() + suffix[minSuffixNum]!;
  }
  return newValue;
};
