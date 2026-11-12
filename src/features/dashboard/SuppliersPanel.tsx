import { hrefFor } from "@/config/modules";
import { dashboardData } from "@/data";
import { Card } from "@/components/ui/Card";
import { homeMoney, PanelHead, RankedList } from "./parts";

/** "Top suppliers" by amount (canvas `v.hTopSuppliers`). */
export function SuppliersPanel() {
  const rows = dashboardData().suppliers.map((r) => [r[0], r[2]] as const);
  return (
    <Card>
      <PanelHead title="Top suppliers" link={{ label: "View all", href: hrefFor("vend", "Suppliers") }} />
      <RankedList rows={rows} format={homeMoney} label="Top suppliers" />
    </Card>
  );
}
