"use client";
/** Payables › Supplier ageing: approved or waiting payables with a balance, per supplier, by age (design `Supplier ageing`). */
import { AgeingTable, MoneyKpis, MoneyOverlays, Stack } from "@/features/receivables";

export function AgeingView() {
  return (
    <Stack>
      <MoneyKpis side="pay" />
      <AgeingTable side="pay" />
      <MoneyOverlays side="pay" />
    </Stack>
  );
}
