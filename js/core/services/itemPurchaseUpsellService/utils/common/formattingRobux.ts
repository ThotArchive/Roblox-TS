import { numberFormat } from 'core-utilities';

export default function formattingRobux(
  robuxAmount: number,
  highlight = true,
  strikeThrough = false,
  forceLightMode = false
) {
  const robuxAmountNumber = numberFormat.getNumberFormat(robuxAmount);
  const formattedRobuxAmount = strikeThrough ? `<s>${robuxAmountNumber}</s>` : robuxAmountNumber;

  if (forceLightMode) {
    return `<span class='icon-robux-16x16 light-theme'></span><span class='text'>${formattedRobuxAmount}</span>`;
  }

  if (!highlight) {
    return `<span class='icon-robux-gray-16x16'></span><span class='text'>${formattedRobuxAmount}</span>`;
  }
  return `<span class='icon-robux-16x16'></span><span class='text-robux'>${formattedRobuxAmount}</span>`;
}
