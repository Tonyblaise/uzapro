"use client";
/**
 * The design's "New record" drawer (`create`, design lines 2776–2786): Name, Status (SearchSelect
 * with "New status") and Notes. Create closes the drawer and shows "Record created." without
 * adding a row (Clarification Q1). Opened by `?action=new` from the header "New" button.
 */
import { useState } from "react";
import { createGenericRecord, NEW_RECORD_STATUSES, type ModuleId } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { GenericDrawer, useGenericOverlay } from "./shared";

/** The design caches added statuses for the session (`this._statusOpts`); a reload resets them. */
let statusOptions: string[] = [...NEW_RECORD_STATUSES];

function NewRecordForm({ moduleId, onClose }: { moduleId: ModuleId; onClose: () => void }) {
  const [options, setOptions] = useState(statusOptions);
  const [status, setStatus] = useState("");
  return (
    <GenericDrawer moduleId={moduleId} title="New record" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input label="Name" placeholder="Enter a name" />
        <SearchSelect
          label="Status"
          noun="status"
          options={options}
          value={status}
          onChange={setStatus}
          onCreate={(name) => {
            statusOptions = [...statusOptions, name];
            setOptions(statusOptions);
            return name;
          }}
        />
        <Input label="Notes" placeholder="Optional" />
        <div className="flex gap-2">
          <Button
            onClick={() => {
              onClose();
              void createGenericRecord();
            }}
          >
            Create
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </GenericDrawer>
  );
}

export function NewRecordDrawer({ moduleId }: { moduleId: ModuleId }) {
  const { params, close } = useGenericOverlay();
  if (params.get("action") !== "new") return null;
  return <NewRecordForm moduleId={moduleId} onClose={close} />;
}
