import ItemPurchaseUpsellService from './itemPurchaseUpsellService/itemPurchaseUpsellService';
import '../../../css/itemPurchaseUpsell/itemPurchaseUpsell.scss';

// This file exposes the ItemPurchaseUpsell Service to the global Roblox object

if (typeof window.Roblox === 'undefined') {
  window.Roblox = {};
}

if (typeof window.Roblox.ItemPurchaseUpsellService === 'undefined') {
  window.Roblox.ItemPurchaseUpsellService = new ItemPurchaseUpsellService();
}

export default ItemPurchaseUpsellService;
