"use client";
/**
 * The design's generic form (`isForm`, design lines 826–840) for Reports › Build a report,
 * Messages › Send message and Settings › Import and export. Each field shows either its value or
 * its placeholder; full-width fields span the row. Save shows "Changes saved."; Cancel resets the
 * fields. Nothing is stored or sent (Clarification Q1).
 */
import { useState } from "react";
import { GENERIC_FORMS, saveGenericForm, type ModuleId } from "@/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { NewRecordDrawer } from "./NewRecordDrawer";

export function GenericForm({ moduleId, tab }: { moduleId: ModuleId; tab: string }) {
  const fields = GENERIC_FORMS[`${moduleId}/${tab}`] ?? [];
  const [round, setRound] = useState(0);
  return (
    <>
      <Card style={{ maxWidth: 760 }}>
        <div key={round} className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {fields.map((f) => (
            <div key={f.label} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
              <Input label={f.label} defaultValue={f.placeholder ? undefined : f.value} placeholder={f.placeholder ? f.value : undefined} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => void saveGenericForm()}>Save</Button>
          <Button variant="secondary" onClick={() => setRound((n) => n + 1)}>
            Cancel
          </Button>
        </div>
      </Card>
      <NewRecordDrawer moduleId={moduleId} />
    </>
  );
}
