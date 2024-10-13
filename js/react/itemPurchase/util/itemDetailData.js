const getCurrentitemDetail = () => {
  const itemContainerElement = document.getElementById('item-container');
  if (itemContainerElement) {
    return {
      itemDetailItemId: parseInt(itemContainerElement.getAttribute('data-item-id'), 10),
      itemDetailItemType: itemContainerElement.getAttribute('data-item-type')
    };
  }
  return null;
};

export default {
  getCurrentitemDetail
};
