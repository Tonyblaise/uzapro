import { dashboardData } from "@/data";
import { Card } from "@/components/ui/Card";
import { PanelHead } from "./parts";
import { SeriesChart } from "./SeriesChart";

/** "Inflow and outflow" bars (canvas `v.hCash`). */
export function CashflowPanel() {
  const { cash } = dashboardData();
  return (
    <Card>
      <PanelHead title="Inflow and outflow" />
      <SeriesChart data={cash} label="Inflow and outflow by month" />
    </Card>
  );
}
