import { hrefFor } from "@/config/modules";
import { dashboardData, dashboardStockUnits } from "@/data";
import { Card } from "@/components/ui/Card";
import { num } from "@/lib/format";
import { PanelHead } from "./parts";

/** "Stock performance" (canvas `v.hs`): value, units in storage, turnover, daily movement, low/out. */
export function StockPerformance() {
  const { stock } = dashboardData();
  const units = dashboardStockUnits();
  const items = `${num(units)} units`;
  return (
    <Card>
      <PanelHead title="Stock performance" link={{ label: "View details", href: hrefFor("inv", "Overview") }} />
      <div className="flex flex-col gap-2">
        <div className="rounded-md bg-green-50 p-3">
          <div className="type-eyebrow text-green-700">Total stock value</div>
          <div className="type-kpi text-text">KES 2.65M</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border p-3">
            <div className="type-eyebrow text-text-muted">Items in storage</div>
            <div className="type-title mt-0.5 text-text">{items}</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="type-eyebrow text-text-muted">Turnover rate</div>
            <div className="type-title mt-0.5 text-text">{stock.turnover}</div>
          </div>
        </div>
        <div className="type-small flex justify-between gap-3 rounded-md border border-border p-3 text-text-muted">
          <span>
            <span className="type-label block text-text">Daily movement</span>
            Opening: {num(units + stock.soldToday)}
          </span>
          <span className="text-right">
            <span className="type-label block text-warning-text">{stock.soldToday} sold today</span>
            Closing: {items}
          </span>
        </div>
        <div className="type-small grid grid-cols-2 gap-2">
          <span className="flex justify-between rounded-sm bg-warning-soft px-3 py-2 text-warning-text">
            Low stock<b>{stock.low}</b>
          </span>
          <span className="flex justify-between rounded-sm bg-danger-soft px-3 py-2 text-danger-text">
            Out of stock<b>{stock.out}</b>
          </span>
        </div>
      </div>
    </Card>
  );
}
