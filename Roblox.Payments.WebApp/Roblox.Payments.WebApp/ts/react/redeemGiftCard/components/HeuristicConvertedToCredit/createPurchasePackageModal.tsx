import React from 'react';
import { createModal, IModalService } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import classnames from 'classnames';
import { TRANSLATION_KEYS } from '../../constants/constants';
import PriceTag from '../../../priceTag/components/PriceTag';

type TPurchasePackageModalProps = {
  availableBalance: number;
  totalBalanceDue: number;
  currencyCode: string;
  numberOfPurchase: number;
  robuxAmountInPackage: number;
  loading: boolean;
  onPurchase: () => void;
  onNeutral: () => void;
  translate: TranslateFunction;
};

export default function createPurchasePackageModal(): [
  ({
    availableBalance,
    totalBalanceDue,
    currencyCode,
    numberOfPurchase,
    robuxAmountInPackage,
    loading,
    onNeutral,
    onPurchase,
    translate
  }: TPurchasePackageModalProps) => JSX.Element,
  IModalService
] {
  const [Modal, modalService] = createModal();

  const PurchasePackageModal = ({
    availableBalance,
    totalBalanceDue,
    currencyCode,
    numberOfPurchase,
    robuxAmountInPackage,
    loading,
    onNeutral,
    onPurchase,
    translate
  }: TPurchasePackageModalProps) => {
    return (
      <Modal
        id='purchase-product-modal'
        title={translate(TRANSLATION_KEYS.BuyRobuxWithCreditModalHeading)}
        body={
          <div className='d-flex justify-content-center flex-direction-column text-center'>
            <div className='purchase-prompt'>
              {numberOfPurchase === 1
                ? translate(TRANSLATION_KEYS.LargestPackageYouCanBuyStep1Message) ||
                  'Largest package you can buy with your available credit:'
                : translate(TRANSLATION_KEYS.NextLargestPackageStep2Message)}
            </div>
            <div className='purchase-logo'>
              <div
                className={classnames(
                  'robux-product-logo',
                  'margin-auto',
                  'robux-graphic',
                  `robux-${robuxAmountInPackage}`
                )}
              />
              <div>
                <span className='icon-robux-16x16' />
                <span className='text-robux'>{robuxAmountInPackage}</span>
              </div>
            </div>
            <div className='purchase-summary d-flex flex-direction-column text-left'>
              <div className='available-credit d-flex justify-content-between'>
                <span>{translate(TRANSLATION_KEYS.AvailableCreditLabel)}</span>
                <PriceTag amount={availableBalance} currencyCode={currencyCode} />
              </div>
              <div className='balance-due d-flex justify-content-between'>
                <span>{translate(TRANSLATION_KEYS.BalanceDueLabel)}</span>
                <PriceTag amount={totalBalanceDue * -1} currencyCode={currencyCode} />
              </div>
              <div className='rbx-divider' />
              <div className='credit-after-transaction d-flex justify-content-between'>
                <span>{translate(TRANSLATION_KEYS.CreditAfterTransaction)}</span>
                <PriceTag amount={availableBalance - totalBalanceDue} currencyCode={currencyCode} />
              </div>
            </div>
          </div>
        }
        neutralButtonText={translate(TRANSLATION_KEYS.CancelAction)}
        actionButtonText={translate(TRANSLATION_KEYS.BuyAction)}
        onNeutral={onNeutral}
        onAction={onPurchase}
        loading={loading}
        actionButtonShow
      />
    );
  };

  return [PurchasePackageModal, modalService];
}
