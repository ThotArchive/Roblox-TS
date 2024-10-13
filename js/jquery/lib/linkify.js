/* global $ */
import { DeviceMeta } from 'Roblox';
import linkifyConstants from '../constants/linkifyConstants';

function isMobile() {
  if (typeof DeviceMeta === 'undefined') {
    return false;
  }
  return DeviceMeta().isPhone;
}

function alreadyLinkified(str) {
  return $(`<div>${str}</div>`).find('a[href]').length > 0;
  // toggleDesc adds in <a onClick> elements which can make this return true incorrectly.
}

function replaceAmpersandEntity(str) {
  return str.replace(/&amp;/g, '&');
}

function removePeriodsAtTheEnd(str) {
  return str.replace(/\.+$/g, '');
}

// http://stackoverflow.com/questions/2419749/get-selected-elements-outer-html
function outerHtml(elem) {
  return elem.clone().wrap('<div>').parent().html();
}

function addProtocolIfMissing(str) {
  if (str.match(linkifyConstants.hasProtocolRegex)) {
    return str;
  }
  return `https://${str}`;
}

function upgradeProtocol(str) {
  return str.replace('http://', 'https://');
}

function isRobloxDomain(link) {
  const hostName = link.prop('hostname');

  if (typeof hostName === 'undefined') {
    // default to the safest behavior
    return false;
  }

  const { robloxDomainSuffixes } = linkifyConstants;
  for (let i = 0; i < robloxDomainSuffixes.length; i++) {
    const hostnameSuffix = robloxDomainSuffixes[i];
    if (hostName.endsWith(hostnameSuffix)) {
      return true;
    }
  }

  return false;
}

function makeLink(originalMatch) {
  // Input is often HTML encoded
  let match = replaceAmpersandEntity(originalMatch);
  const text = match;
  match = removePeriodsAtTheEnd(match);
  let href = addProtocolIfMissing(match);
  href = upgradeProtocol(href);

  const link = $('<a></a>');
  link.addClass(linkifyConstants.cssClass);
  link.attr('href', href);
  link.text(text);

  // Mobile links have to open in the same tab
  if (!isMobile()) {
    link.attr('target', '_blank');
  }

  // Prevent target site from accessing originating document via window.Opener
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener
  let relValue = 'noopener';

  // Add noreferrer to avoid exposing Referer header to third parties
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noreferrer
  if (!isRobloxDomain(link)) {
    relValue += ' noreferrer';
  }
  link.attr('rel', relValue);

  return outerHtml(link);
}

function linkifyString(str) {
  if (alreadyLinkified(str)) {
    return str;
  }
  return str.replace(linkifyConstants.regex, makeLink);
}

export default {
  String: linkifyString
};
