export const getMetaData = () => {
  const itemPurchaseMetaElement = document.getElementById('ItemPurchaseAjaxData');
  if (itemPurchaseMetaElement) {
    return {
      userRobuxBalance: parseInt(
        itemPurchaseMetaElement.getAttribute('data-user-balance-robux'),
        10
      ),
      userBc: parseInt(itemPurchaseMetaElement.getAttribute('data-user-bc'), 10),
      hasCurrencyServiceError:
        itemPurchaseMetaElement.getAttribute('data-has-currency-service-error') === 'True',
      currencyServiceErrorMessage: itemPurchaseMetaElement.getAttribute(
        'data-currency-service-error-message'
      )
    };
  }
  return {};
};

export const addCommasToMoney = price => {
  const nStr = price.toString();
  const x = nStr.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? `.${x[1]}` : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1,$2');
  }
  return x1 + x2;
};

export const formateSellerName = name => {
  if (name.toUpperCase() === 'ROBLOX') {
    return 'ROBLOX';
  }
  return name;
};
