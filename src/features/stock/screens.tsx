"use client";

import { useRole } from "@/data";
import { Button } from "@/components/ui/Button";
import type { ScreenMap } from "../types";
import { useOverlayParams } from "./shared";
import { StockLevels } from "./StockLevels";
import { StockOverview } from "./StockOverview";
import { TransferList } from "./TransferList";
import { WarehouseList } from "./WarehouseList";
import { WastageList } from "./WastageList";

/** Header action per tab (design `headerActions` for `inv`); none for a role limited to Stock management (Cashier). */
function action(label: string, key: string) {
  function HeaderAction() {
    const role = useRole();
    const { open } = useOverlayParams();
    if (role.tabs?.inv) return null;
    return (
      <Button icon="plus" onClick={() => open({ action: key })}>
        {label}
      </Button>
    );
  }
  return HeaderAction;
}

/** Tab slug → screen for the Stock module (US5). */
export const stockScreens: ScreenMap = {
  overview: { Body: StockOverview, Actions: action("Stock in", "stock") },
  "stock-management": { Body: StockLevels, Actions: action("Stock in", "stock") },
  "transfer-stock": { Body: TransferList, Actions: action("New transfer", "transfer") },
  wastage: { Body: WastageList, Actions: action("Record wastage", "waste") },
  warehouses: { Body: WarehouseList, Actions: action("New warehouse", "warehouse") },
};
