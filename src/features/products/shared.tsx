"use client";

import { useCallback, useRef, type DragEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { checkImage, toast, type ProductImage } from "@/data";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { Icon } from "@/components/ui/Icon";

/** The design's drawer subtitle (`drawerCrumb` = module name). */
export const CRUMB = "Products";

/**
 * Overlay state from the URL (contracts/routes.md): `?action=new` opens a form, `?view=<name>`
 * opens a record. Closing uses `router.replace(pathname)` so no history entry is added.
 */
export function useOverlayParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string>) => router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false }),
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { action: params.get("action"), view: params.get("view"), get: (k: string) => params.get(k), open, close };
}

/** Margin as the design shows it (`rowMargin`): "+40%", "−5%" or "—". */
export function marginText(cost: number, price: number): string {
  if (!(cost > 0) || !(price > 0)) return "—";
  return `${price >= cost ? "+" : "−"}${Math.abs(Math.round(((price - cost) / price) * 100))}%`;
}

/** Read a picked image with the design's checks (`prodImage` / `catImage`). */
export function readImage(file: File | undefined, onLoad: (img: ProductImage) => void, mode: "dataUrl" | "objectUrl") {
  if (!file) return;
  const check = checkImage(file);
  if (!check.ok) {
    toast(check.message);
    return;
  }
  if (mode === "objectUrl") {
    onLoad({ name: file.name, url: URL.createObjectURL(file) });
    return;
  }
  const rd = new FileReader();
  rd.onload = () => onLoad({ name: file.name, url: String(rd.result) });
  rd.readAsDataURL(file);
}

/** The design's image upload box: dashed drop zone, or the picked image with Replace/Remove. */
export function ImageDrop({
  label,
  image,
  onChange,
  mode,
  thumb = 64,
  replace = true,
}: {
  label: string;
  image: ProductImage | undefined;
  onChange: (img: ProductImage | undefined) => void;
  mode: "dataUrl" | "objectUrl";
  thumb?: number;
  replace?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const pick = () => input.current?.click();
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    readImage(e.dataTransfer.files?.[0], onChange, mode);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="type-label text-text">{label}</span>
      <input
        ref={input}
        type="file"
        accept=".svg,.png,.jpg,.jpeg"
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={(e) => {
          readImage(e.target.files?.[0], onChange, mode);
          e.target.value = "";
        }}
      />
      {image ? (
        <div className="flex items-center gap-3 rounded-md bg-grey-100 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data/blob URL preview */}
          <img src={image.url} alt="" className="flex-none rounded-sm object-cover" style={{ width: thumb, height: thumb }} />
          <span className="type-small min-w-0 flex-1 truncate text-text-secondary">{image.name}</span>
          {replace && (
            <Button variant="secondary" size="sm" onClick={pick}>
              Replace
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-action bg-surface px-4 py-6 hover:bg-green-50"
        >
          <span className="grid size-9 place-items-center rounded-full bg-green-50 text-green-600">
            <Icon name="upload" size={18} />
          </span>
          <span className="type-label text-text">Click or drag an image to upload</span>
          <span className="type-caption text-text-muted">SVG, PNG or JPG, up to 5MB</span>
        </button>
      )}
    </div>
  );
}

/** The design's row delete confirm drawer (`isRowConfirm`). */
export function RowConfirm({ name, onDelete, onClose }: { name: string | null; onDelete: () => void; onClose: () => void }) {
  return (
    <Drawer open={name !== null} title={`Delete ${name ?? ""}?`} subtitle={CRUMB} width={440} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="type-body text-text">This permanently deletes this record.</div>
        <div className="flex gap-2">
          <Button variant="danger" icon="trash-2" onClick={onDelete}>
            Delete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

/** Thumbnail before a name in a table cell (the design's column `thumb`, 28px, package icon when empty). */
export function Thumbed({ name, image }: { name: string; image?: ProductImage }) {
  return (
    <span className="inline-flex items-center gap-2 font-medium text-text">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data/blob URL preview
        <img src={image.url} alt="" className="size-7 flex-none rounded-sm object-cover" />
      ) : (
        <span className="grid size-7 flex-none place-items-center rounded-sm bg-grey-100 text-text-muted">
          <Icon name="package" size={14} />
        </span>
      )}
      {name}
    </span>
  );
}
