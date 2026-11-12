import { hrefFor } from "@/config/modules";
import { salesOverviewData } from "@/data";
import { Card } from "@/components/ui/Card";
import { homeMoney, PanelHead, RankedList } from "./parts";

/** Rows of a Sales overview board as [name, amount] (canvas `board()`). */
export function board(title: string): [string, number][] {
  const b = salesOverviewData().boards.find((x) => x.t === title);
  return b ? b.rows.map((r) => [r[0], r[2]]) : [];
}

/** "Top selling products": the Sales "Top products" board, first five. */
export function TopProducts() {
  return (
    <Card>
      <PanelHead title="Top selling products" link={{ label: "View stock", href: hrefFor("inv", "Overview") }} />
      <RankedList rows={board("Top products").slice(0, 5)} format={homeMoney} label="Top selling products" />
    </Card>
  );
}
