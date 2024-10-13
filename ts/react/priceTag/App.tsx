import React from 'react';
import PropTypes from 'prop-types';
import { fireEvent } from 'roblox-event-tracker';
import PriceTag from './components/PriceTag';
import { TAppProps } from './constants/typeDefinitions';
import { COUNTERS } from './constants/priceTagConstants';

function App({ containerDataset, options }: TAppProps): JSX.Element | null {
  const amount = options?.amount ?? parseFloat(containerDataset?.amount ?? String());
  const currencyCode = options?.currencyCode ?? containerDataset?.currencyCode;
  if (!currencyCode || (!amount && amount !== 0) || Number.isNaN(amount)) {
    fireEvent(COUNTERS.PRICE_DATA_NOT_VALID);
    return null;
  }

  return <PriceTag {...options} amount={amount} currencyCode={currencyCode} />;
}

App.defaultProps = {
  containerDataset: {},
  options: {}
};

App.propTypes = {
  containerDataset: PropTypes.shape({
    amount: PropTypes.string,
    currencyCode: PropTypes.string
  }),
  options: PropTypes.shape({
    amount: PropTypes.number,
    currencyCode: PropTypes.string,
    tagClassName: PropTypes.string
  })
};

export default App;
