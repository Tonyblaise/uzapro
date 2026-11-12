import { hrefFor } from "@/config/modules";
import { dashboardData } from "@/data";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { num } from "@/lib/format";
import { PanelHead } from "./parts";

/** "Invoice analytics": count and total per invoice status, frozen from the seed list (R9). */
export function InvoiceAnalytics() {
  const { invoiceAnalytics } = dashboardData();
  return (
    <Card>
      <PanelHead title="Invoice analytics" link={{ label: "View details", href: hrefFor("sales", "Invoices") }} />
      <div className="flex flex-col gap-2">
        {invoiceAnalytics
          .filter((g) => g.count > 0)
          .map((g) => (
            <div key={g.label} className="flex items-center justify-between gap-3 rounded-sm bg-canvas p-3">
              <StatusPill tone={g.tone}>{g.label}</StatusPill>
              <span className="type-label u-num text-text">
                {g.count}, KES {num(g.amount)}
              </span>
            </div>
          ))}
      </div>
    </Card>
  );
}
