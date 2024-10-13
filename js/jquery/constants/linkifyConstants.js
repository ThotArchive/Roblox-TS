export default {
  cssClass: 'text-link',
  hasProtocolRegex: /(https?:\/\/)/,
  regex: /(https?:\/\/)?(?:www\.)?([a-z0-9-]{2,}\.)*(((m|de|www|web|api|blog|wiki|corp|events|polls|bloxcon|developer|devforum|forum|status|create)\.roblox\.com|robloxlabs\.com)|(www\.shoproblox\.com)|(roblox\.status\.io)|(rblx\.co)|help\.roblox\.com(?![A-Za-z0-9/.]*\/attachments\/))(?!\/[A-Za-z0-9-+&@#/=~_|!:,.;]*%)((\/[A-Za-z0-9-+&@#/%?=~_|!:,.;]*)|(?=\s|\b))/gm,
  robloxDomainSuffixes: ['.roblox.com', '.robloxlabs.com']
};
