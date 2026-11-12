"use client";

import { useState } from "react";
import { ALL_STORES, useStockVariantRows, type StockLevelFilter, type StockVariantRow } from "@/data";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { num } from "@/lib/format";
import { useOverlayParams, useStoreNames } from "./shared";
import { StockHistory } from "./StockHistory";
import { StockInOverlay } from "./StockInForm";

/** Design "Stock management" table with the store and level filters (`hasStoreFilter`). */
export function StockLevels() {
  const [store, setStore] = useState(ALL_STORES);
  const [level, setLevel] = useState<StockLevelFilter>("all");
  const stores = useStoreNames();
  const { rows, levelOptions } = useStockVariantRows(store, level);
  const { view, get, open, close } = useOverlayParams();
  const openRow = (r: StockVariantRow) => open({ view: r.product, store: r.store });

  const columns: DataColumn<StockVariantRow>[] = [
    { key: "product", title: "Product" },
    { key: "variant", title: "Variant" },
    { key: "store", title: "Store" },
    { key: "quantity", title: "Quantity", numeric: true, text: (r) => num(r.quantity) },
    { key: "value", title: "Stock value (KES)", numeric: true, text: (r) => num(r.value) },
    { key: "actions", title: "", width: 48, render: (r) => <RowActions items={[{ label: "View", onClick: () => openRow(r) }]} /> },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => `${r.product}|${r.variant}|${r.store}`}
        onRowClick={openRow}
        filters={
          <>
            <div className="min-w-[160px] flex-[0_1_200px]">
              <SearchSelect noun="store" options={[ALL_STORES, ...stores]} value={store} onChange={setStore} />
            </div>
            <div className="min-w-[150px] flex-[0_1_180px]">
              <SearchSelect noun="stock level" options={levelOptions} value={level} onChange={(v) => setLevel(v as StockLevelFilter)} />
            </div>
          </>
        }
      />
      {view && <StockHistory product={view} store={get("store") ?? ""} onClose={close} />}
      <StockInOverlay />
    </>
  );
}
