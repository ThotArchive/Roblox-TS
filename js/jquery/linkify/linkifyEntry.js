import $ from 'jquery';
import linkify from '../lib/linkify';

window.Roblox = window.Roblox || {};
window.Roblox.Linkify = linkify;

// Allow .linkify() to be called on jQuery elements
$.fn.linkify = function () {
  return this.each(function () {
    const element = $(this);
    const html = element.html();
    if (typeof html !== 'undefined' && html !== null) {
      const newHtml = linkify.String(html);
      element.html(newHtml);
    }
  });
};

// Linkify all tags with 'linkify' class on document ready
$(function () {
  $('.linkify').linkify();
});
