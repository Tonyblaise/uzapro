import { hrefFor } from "@/config/modules";
import { dashboardData } from "@/data";
import { Card } from "@/components/ui/Card";
import { homeMoney, PanelHead, RankedList } from "./parts";
import { board } from "./TopProducts";

/** "Customers overview": new, returning and on-credit counts (canvas `v.hCustomers`). */
export function CustomersPanel() {
  return (
    <Card>
      <PanelHead title="Customers overview" />
      <RankedList rows={dashboardData().customers} format={String} label="Customers overview" />
    </Card>
  );
}

/** "Top customers": the Sales "Top customers" board, first five (canvas `v.hTopCustomers`). */
export function TopCustomersPanel() {
  return (
    <Card>
      <PanelHead title="Top customers" link={{ label: "View all", href: hrefFor("cust", "Customers") }} />
      <RankedList rows={board("Top customers").slice(0, 5)} format={homeMoney} label="Top customers" />
    </Card>
  );
}
