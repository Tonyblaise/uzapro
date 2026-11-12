"use client";
/**
 * The File Manager drawer (design `docsDrawer` and `docTitle`, lines 3354–3388 and 3960–3966).
 * Which panel shows comes from the URL: `?action=folder|upload`, `?view=<fileId>` or
 * `?view=<folderId>&kind=folder`, each with an optional `&step=edit|delete`.
 */
import type { ReactNode } from "react";
import { Drawer } from "@/components/ui/Overlay";
import { useDocs, type DocKind } from "@/data";
import { DeleteDocConfirm } from "./DeleteDocConfirm";
import { EditDocForm } from "./EditDocForm";
import { FileDrawer } from "./FileDrawer";
import { FolderDrawer } from "./FolderDrawer";
import { FolderForm } from "./FolderForm";
import { UploadForm } from "./UploadForm";
import { CRUMB, DRAWER_WIDTH, useDocsUrl } from "./shared";

export function FileOverlays() {
  const { params, dir, go } = useDocsUrl();
  const { folders, files } = useDocs();
  const close = () => go({});
  const action = params.get("action");
  const view = params.get("view");
  const step = params.get("step");
  const kind: DocKind = params.get("kind") === "folder" ? "folder" : "file";

  let title = "";
  let body: ReactNode = null;
  if (action === "folder") {
    title = "New folder";
    body = <FolderForm parent={dir || "company"} onDone={close} />;
  } else if (action === "upload") {
    title = "Upload file";
    body = <UploadForm folder={dir || "inbox"} onDone={close} />;
  } else if (view) {
    const item = kind === "file" ? files.find((f) => f.id === view) : folders.find((f) => f.id === view);
    if (item) {
      /** The design's `docBack`: Cancel returns to the item's file or folder drawer. */
      const back = () => go({ view: item.id, kind: kind === "folder" ? "folder" : undefined });
      if (step === "edit") {
        title = kind === "file" ? "Edit file" : "Edit folder";
        body = <EditDocForm key={`${kind}:${item.id}`} kind={kind} item={item} onSaved={back} onCancel={back} />;
      } else if (step === "delete") {
        title = `Delete ${item.name}?`;
        body = <DeleteDocConfirm kind={kind} item={item} openDir={dir} onCancel={back} onDeleted={(next) => go({ dir: next })} />;
      } else if (kind === "file" && "folder" in item) {
        title = item.name;
        body = <FileDrawer file={item} />;
      } else if (kind === "folder" && "parent" in item) {
        title = item.name;
        body = <FolderDrawer folder={item} />;
      }
    }
  }

  return (
    <Drawer open={body !== null} title={title} subtitle={CRUMB} width={DRAWER_WIDTH} onClose={close}>
      {body}
    </Drawer>
  );
}
