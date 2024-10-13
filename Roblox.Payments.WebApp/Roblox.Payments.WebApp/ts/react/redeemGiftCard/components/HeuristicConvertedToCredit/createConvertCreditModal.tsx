import { createModal, IModalService } from 'react-style-guide';
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { TRANSLATION_KEYS } from '../../constants/constants';

type TConvertCreditModalProps = {
  remainingCreditBalance: number;
  currencyCode: string;
  robuxConversionAmount: number;
  loading: boolean;
  numberOfPurchase: number;
  onConvert: () => void;
  onNeutral: () => void;
  translate: TranslateFunction;
};
export default function createConvertCreditModal(): [
  ({
    remainingCreditBalance,
    robuxConversionAmount,
    currencyCode,
    loading,
    numberOfPurchase,
    onConvert,
    onNeutral,
    translate
  }: TConvertCreditModalProps) => JSX.Element,
  IModalService
] {
  const [Modal, modalService] = createModal();

  function ConvertCreditModal({
    remainingCreditBalance,
    currencyCode,
    robuxConversionAmount,
    loading,
    numberOfPurchase,
    onConvert,
    onNeutral,
    translate
  }: TConvertCreditModalProps): JSX.Element {
    const triggerFiatCreditRendering = () => {
      window.dispatchEvent(
        new CustomEvent('price-tag:render', {
          detail: {
            targetSelector: '.fiat-price-tag'
          }
        })
      );
    };
    const body = (
      <div
        className='text-center conversion-message'
        // if it is the first conversion, message is "Convert to robux ..."
        // if it is not first conversion, message is "Your Purchase was successful ..."
        dangerouslySetInnerHTML={{
          __html:
            numberOfPurchase === 1
              ? translate(TRANSLATION_KEYS.ConvertCreditToRobuxMessage, {
                  robuxAmount: `<br /><span class="icon-robux-16x16"></span>${robuxConversionAmount}`
                })
              : translate(TRANSLATION_KEYS.ConvertToRobuxStep3Message, {
                  remainingCreditBalance: `<span class='fiat-price-tag ml-1' data-amount=${remainingCreditBalance} data-currency-code=${currencyCode}></span>`,
                  lineBreaker: '<br />',
                  robuxConversionAmount: `<span class="icon-robux-16x16"></span>${robuxConversionAmount}`
                })
        }}
        ref={() => triggerFiatCreditRendering()}
      />
    );

    return (
      <Modal
        id='convert-credit-modal'
        title={translate(TRANSLATION_KEYS.ConvertCreditToRobuxModalHeading)}
        body={body}
        neutralButtonText={translate(TRANSLATION_KEYS.CancelAction)}
        actionButtonText={translate(TRANSLATION_KEYS.ConvertToRobuxAction)}
        onNeutral={onNeutral}
        onAction={onConvert}
        loading={loading}
        actionButtonShow
      />
    );
  }

  return [ConvertCreditModal, modalService];
}
