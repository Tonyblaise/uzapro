"use client";
import { Can } from "@/components/ui/Can";
/**
 * File details drawer (design `isDocFile`, markup lines 1545–1570): preview box with the extension,
 * Size / Modified / Owner / Linked to, notes, the Folder select that moves the file, then Download
 * (message only), Edit and Delete.
 */
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { createFolder, docSize, downloadFile, folderOptions, moveFile, useDocs, type DocFile } from "@/data";
import { FieldRows, NotesBlock, PENDING, docDate, useDocsUrl } from "./shared";

export function FileDrawer({ file }: { file: DocFile }) {
  const { folders } = useDocs();
  const { go } = useDocsUrl();
  const ext = file.name.includes(".") ? (file.name.split(".").pop() ?? "").toUpperCase() : "File";

  /** The design's `newFolder`: a top-level folder, then the file moves into it. */
  const onCreate = (name: string) => {
    void createFolder(name).then((r) => {
      if (r.ok) void moveFile(file.id, r.value.id);
    });
    return PENDING;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="type-micro flex h-[160px] flex-col items-center justify-center gap-2 rounded-md bg-grey-100 text-text-muted">
        <Icon name="file-text" size={18} />
        <span>{ext}</span>
      </div>
      <FieldRows
        rows={[
          { label: "Size", text: docSize(file.size) },
          { label: "Modified", text: docDate(file.modified) },
          { label: "Owner", text: file.owner },
          { label: "Linked to", text: file.linked },
        ]}
      />
      <NotesBlock notes={file.notes} />
      <SearchSelect
        label="Folder"
        noun="folder"
        options={folderOptions(folders)}
        value={file.folder}
        onChange={(v) => v !== PENDING && v !== file.folder && void moveFile(file.id, v)}
        onCreate={onCreate}
      />
      <div className="flex flex-wrap gap-2">
        <Button icon="download" onClick={() => void downloadFile(file.id)}>
          Download
        </Button>
        <Can need="write">
          <Button variant="secondary" icon="pencil" onClick={() => go({ view: file.id, step: "edit" })}>
            Edit
          </Button>
        </Can>
        <Can need="delete">
          <Button variant="secondary" icon="trash-2" onClick={() => go({ view: file.id, step: "delete" })}>
            Delete
          </Button>
        </Can>
      </div>
    </div>
  );
}
