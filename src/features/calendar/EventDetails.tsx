"use client";
import { Can } from "@/components/ui/Can";
/** The design's "Event details" modal (`isCalEvent`): title, notes, start, end, address, Delete and Edit. */
import type { ReactNode } from "react";
import { calStamp, type CalEvent } from "@/data";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";

function Line({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="type-body flex items-start gap-3 text-text-muted">
      <span className="mt-0.5 inline-flex flex-none">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {label}: <b className="font-medium text-text">{children}</b>
      </span>
    </div>
  );
}

export function EventDetails({ event: e, onClose, onEdit, onDelete }: { event: CalEvent; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <Modal open title="Event details" onClose={onClose} width={520}>
      <div className="flex flex-col gap-4">
        <div>
          <div className="type-card-title text-text [overflow-wrap:anywhere]">{e.title}</div>
          {e.notes && <div className="type-body mt-2 whitespace-pre-wrap text-text-secondary [overflow-wrap:anywhere]">{e.notes}</div>}
        </div>
        <div className="flex flex-col gap-3">
          <Line icon="calendar" label="Event start">
            {calStamp(e.date, e.time)}
          </Line>
          <Line icon="calendar" label="Event end">
            {calStamp(e.endDate || e.date, e.endTime || e.time)}
          </Line>
          {e.address && (
            <Line icon="map-pin" label="Address">
              {e.address}
            </Line>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Can need="delete">
            <Button variant="secondary" fullWidth onClick={onDelete}>
              Delete
            </Button>
          </Can>
          <Can need="write">
            <Button fullWidth onClick={onEdit}>
              Edit
            </Button>
          </Can>
        </div>
      </div>
    </Modal>
  );
}
