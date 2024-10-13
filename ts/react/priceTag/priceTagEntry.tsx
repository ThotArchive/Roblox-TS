import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import App from './App';
import {
  DEFAULT_FIAT_PRICE_TAG_ELEMENT_ID_SELECTOR,
  DEFAULT_FIAT_PRICE_TAG_ELEMENTS_CLASSNAME_SELECTOR,
  RENDER_PRICE_TAGS_CUSTOM_EVT
} from './constants/priceTagConstants';
import { TPriceDivTagDataSet, TPriceTagEventOptions } from './constants/typeDefinitions';
import '../../../css/priceTag/priceTag.scss';

/**
 * Render the price tag react apps on one page for divs with the `targetClassName` as classname
 * If targetClassname is not provided, this event will try to find all divs with .fiat-price-tag classname,
 * if not exist, then it will try to find the div with id selector: #fiat-price-tag
 *
 * An example of how to use the event listener
 * ```javascript
 * window.dispatchEvent(
 *   new CustomEvent('price-tag:render', {
 *       detail: {
 *         tagClassName: 'font-header-1',
 *         targetSelector: '.fiat-price-tag'
 *       }
 *     }
 *   )
 * );
 * ```
 */
function renderPriceTags(options?: TPriceTagEventOptions) {
  const targetSelector =
    options?.targetSelector ?? DEFAULT_FIAT_PRICE_TAG_ELEMENTS_CLASSNAME_SELECTOR;
  let allPriceTagElements = document.querySelectorAll(targetSelector);
  if (allPriceTagElements.length === 0) {
    allPriceTagElements = document.querySelectorAll(DEFAULT_FIAT_PRICE_TAG_ELEMENT_ID_SELECTOR);
  }

  allPriceTagElements.forEach(element => {
    const dataset = (element as HTMLElement).dataset as TPriceDivTagDataSet;
    render(<App containerDataset={dataset} options={options} />, element);
  });
}

ready(() => {
  window.addEventListener(RENDER_PRICE_TAGS_CUSTOM_EVT, event => {
    const options = ((event as unknown) as Record<string, unknown>).detail as
      | TPriceTagEventOptions
      | undefined;
    renderPriceTags(options);
  });
});
