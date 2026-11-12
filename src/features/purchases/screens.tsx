import type { ScreenMap } from "../types";
import { GoodsReceiptList } from "./GoodsReceiptList";
import { NewPurchaseOrderAction, PurchaseOrderList } from "./PurchaseOrderList";
import { NewPurchaseReturnAction, PurchaseReturnList } from "./PurchaseReturnList";
import { PurchasesOverview } from "./PurchasesOverview";
import { RejectedItemList } from "./RejectedItemList";

/**
 * Tab slug → screen (feature 002). Header actions follow the design's `headerActions` for `buy`:
 * "New purchase order" on Overview and Purchase orders, "New purchase return" on Purchase returns,
 * none on Goods receipts.
 */
export const purchasesScreens: ScreenMap = {
  overview: { Body: PurchasesOverview, Actions: NewPurchaseOrderAction },
  "purchase-orders": { Body: PurchaseOrderList, Actions: NewPurchaseOrderAction },
  "goods-receipts": { Body: GoodsReceiptList },
  "purchase-returns": { Body: PurchaseReturnList, Actions: NewPurchaseReturnAction },
  "rejected-items": { Body: RejectedItemList },
};
