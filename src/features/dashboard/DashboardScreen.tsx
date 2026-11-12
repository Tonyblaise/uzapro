"use client";

import { useRole } from "@/data";
import { AttentionList } from "./AttentionList";
import { BannerRow } from "./BannerRow";
import { CashflowPanel } from "./CashflowPanel";
import { ComparePanel } from "./ComparePanel";
import { CustomersPanel, TopCustomersPanel } from "./CustomersPanel";
import { InvoiceAnalytics } from "./InvoiceAnalytics";
import { KpiGrid } from "./KpiGrid";
import { Narrow, Wide } from "./parts";
import { QuickTasks } from "./QuickTasks";
import { StockPerformance } from "./StockPerformance";
import { SuppliersPanel } from "./SuppliersPanel";
import { TopProducts } from "./TopProducts";

const PANEL_GRID = "grid grid-cols-[repeat(auto-fit,minmax(var(--grid-panel-min),1fr))] gap-4";

/**
 * Dashboard body under the "Welcome back" header. As in the canvas, roles with all modules or
 * with `figures` get the figures dashboard (`v.homeDash`); the others get the simple home
 * (`v.homeSimple`): quick tasks and the attention list.
 */
export function DashboardScreen() {
  const role = useRole();
  const homeDash = !role.tabs?.home || !!role.figures;

  if (!homeDash) {
    return (
      <div className="flex flex-col gap-6">
        <QuickTasks tasks={role.tasks} />
        <AttentionList items={role.attention} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <BannerRow />
      <KpiGrid />
      <ComparePanel />
      <div className="flex flex-wrap gap-4">
        <Wide>
          <CashflowPanel />
        </Wide>
        <Narrow>
          <InvoiceAnalytics />
        </Narrow>
      </div>
      <div className="flex flex-wrap gap-4">
        <Wide>
          <TopProducts />
        </Wide>
        <Narrow>
          <StockPerformance />
        </Narrow>
      </div>
      <div className={PANEL_GRID}>
        <CustomersPanel />
      </div>
      <div className={PANEL_GRID}>
        <TopCustomersPanel />
        <SuppliersPanel />
      </div>
    </div>
  );
}
