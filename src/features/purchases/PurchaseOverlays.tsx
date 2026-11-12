"use client";
/**
 * Mounts the Purchases drawer the URL asks for (contracts/routes.md). Every Purchases tab mounts it,
 * and the reference prefix picks the view, so moving between linked records (order → receipt →
 * order) stays on the current tab, as the design's single drawer does.
 */
import { GoodsReceiptView } from "./GoodsReceiptView";
import { PurchaseOrderForm } from "./PurchaseOrderForm";
import { PurchaseOrderView } from "./PurchaseOrderView";
import { PurchaseReturnForm } from "./PurchaseReturnForm";
import { ReceiveForm } from "./ReceiveForm";
import { PurchaseRecordView } from "./RecordView";
import { usePurchaseOverlay } from "./shared";

export function PurchaseOverlays({ create }: { create?: "order" | "return" }) {
  const { params, open, close } = usePurchaseOverlay();
  const action = params.get("action");
  const edit = params.get("edit");
  const view = params.get("view");
  const step = params.get("step");

  if (action === "new" && create === "order") return <PurchaseOrderForm onClose={close} />;
  if (action === "new" && create === "return") return <PurchaseReturnForm onClose={close} />;
  if (edit?.startsWith("PUR-ORD-")) return <PurchaseOrderForm key={edit} edit={edit} onClose={close} />;
  if (!view) return null;
  const openReceipt = (grn: string) => open({ view: grn });
  if (view.startsWith("PUR-ORD-")) {
    if (step === "receive") return <ReceiveForm key={view} refId={view} onClose={close} onDone={() => open({ view })} />;
    return (
      <PurchaseOrderView
        key={view}
        refId={view}
        onClose={close}
        onEdit={() => open({ edit: view })}
        onReceive={() => open({ view, step: "receive" })}
        onOpenReceipt={openReceipt}
      />
    );
  }
  if (view.startsWith("GRN-")) return <GoodsReceiptView key={view} refId={view} onClose={close} onOpenOrder={(po) => open({ view: po })} />;
  if (view.startsWith("PRT-")) return <PurchaseRecordView key={view} kind="return" refId={view} onClose={close} onOpenReceipt={openReceipt} />;
  if (view.startsWith("REJ-")) return <PurchaseRecordView key={view} kind="rejected" refId={view} onClose={close} onOpenReceipt={openReceipt} />;
  return null;
}
