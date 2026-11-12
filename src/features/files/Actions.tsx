"use client";
/** Header actions of File Manager (design `headerActions` for `isDocs`, lines 4059–4062). */
import { Button } from "@/components/ui/Button";
import { useDocsUrl } from "./shared";

export function FileActions() {
  const { go } = useDocsUrl();
  return (
    <>
      <Button variant="secondary" icon="plus" onClick={() => go({ action: "folder" })}>
        New folder
      </Button>
      <Button icon="upload" onClick={() => go({ action: "upload" })}>
        Upload
      </Button>
    </>
  );
}
