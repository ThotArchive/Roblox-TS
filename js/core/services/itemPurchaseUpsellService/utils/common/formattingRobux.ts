import { NumberFormatting } from 'Roblox';

export default function formattingRobux(robuxAmount: number, highlight = true) {
  if (!highlight) {
    return `<span class='icon-robux-gray-16x16'></span><span class='text'>${NumberFormatting.commas(
      robuxAmount
    )}</span>`;
  }
  return `<span class='icon-robux-16x16'></span><span class='text-robux'>${NumberFormatting.commas(
    robuxAmount
  )}</span>`;
}
