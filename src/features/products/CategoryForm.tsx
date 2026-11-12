"use client";

import { useState } from "react";
import { createCategory, toast, updateCategory, useCategories, type Category, type ProductImage } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CRUMB, ImageDrop } from "./shared";

const TOP = "None (top level)";

/**
 * Design `isCatNew` (drawer 560): Category name, Parent category (optional), Description
 * (optional), Category image (optional), Close + "Add category" / "Add sub-category" / "Save".
 */
export function CategoryForm({
  open,
  edit,
  initialName = "",
  initialParent = "",
  onClose,
  onSaved,
}: {
  open: boolean;
  /** The category being edited (design `catEdit`). */
  edit?: Category;
  initialName?: string;
  initialParent?: string;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  if (!open) return null;
  return <CategoryFormBody key={edit?.name ?? `new:${initialName}:${initialParent}`} edit={edit} initialName={initialName} initialParent={initialParent} onClose={onClose} onSaved={onSaved} />;
}

function CategoryFormBody({
  edit,
  initialName,
  initialParent,
  onClose,
  onSaved,
}: {
  edit?: Category;
  initialName: string;
  initialParent: string;
  onClose: () => void;
  onSaved?: (name: string) => void;
}) {
  const categories = useCategories();
  const [name, setName] = useState(edit?.name ?? initialName);
  const [desc, setDesc] = useState(edit ? (edit.description === "—" ? "" : edit.description) : "");
  const [parent, setParent] = useState(edit?.parent ?? initialParent);
  const [image, setImage] = useState<ProductImage | undefined>(edit?.image);

  // Design `catParents`: top-level categories, minus the one being edited, and none at all when
  // the edited category has its own sub-categories.
  const editHasSubs = !!edit && categories.some((c) => c.parent === edit.name);
  const parents = [TOP, ...categories.filter((c) => !c.parent && c.name !== edit?.name && !editHasSubs).map((c) => c.name)];

  const save = async () => {
    const input = { name, description: desc, parent, ...(image ? { image } : {}) };
    const res = edit ? await updateCategory(edit.name, input) : await createCategory(input);
    if (!res.ok) {
      toast(res.message);
      return;
    }
    onSaved?.(res.value.name);
  };

  return (
    <Drawer open title={edit ? "Edit category" : "Add category"} subtitle={CRUMB} width={560} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input label="Category name" placeholder="Enter a name" value={name} onChange={(e) => setName(e.target.value)} />
        <SearchSelect label="Parent category (optional)" options={parents} value={parent || TOP} onChange={(v) => setParent(v === TOP ? "" : v)} />
        <Textarea label="Description (optional)" rows={2} placeholder="Briefly describe what goes in this category" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <ImageDrop label="Category image (optional)" image={image} onChange={setImage} mode="objectUrl" thumb={56} replace={false} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button disabled={!name.trim()} onClick={save}>
            {edit ? "Save" : parent ? "Add sub-category" : "Add category"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
