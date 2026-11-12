"use client";

import { useState } from "react";
import { dashboardData } from "@/data";
import { Card } from "@/components/ui/Card";
import { SeriesChart, type ChartMode } from "./SeriesChart";

const MODES: ChartMode[] = ["Bars", "Lines", "Area"];

/** "Comparative analysis": sales and purchases over 6 months with a Bars / Lines / Area toggle. */
export function ComparePanel() {
  const [mode, setMode] = useState<ChartMode>("Bars");
  const { compare } = dashboardData();
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-card-title m-0 text-text">Comparative analysis</h2>
          <div className="type-small text-text-muted">Sales and purchases over 6 months</div>
        </div>
        <div role="group" aria-label="Chart style" className="flex gap-0.5 rounded-md bg-canvas p-0.5">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`type-small cursor-pointer rounded-sm border-none px-3 py-1 ${mode === m ? "bg-surface text-action" : "bg-transparent text-text-muted"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <SeriesChart data={compare} mode={mode} label="Sales and purchases by month" />
    </Card>
  );
}
