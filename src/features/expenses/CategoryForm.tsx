"use client";
/**
 * New / edit expense category (design `isExpCat` with `ec`, opened by `ecOpen`): name (with the
 * "already exists" check), colour swatches, parent, description, monthly budget, Needs approval and
 * "Category is active". Opens with `?action=new` or `?view=<name>` on Expense categories.
 */
import { useState } from "react";
import { CATEGORY_SWATCHES, saveExpenseCategory, toast, useExpenseCategoryList, type ExpenseCategory } from "@/data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CheckRow, TextArea, n } from "./shared";

const TOP = "None (top level)";

interface Form {
  name: string;
  color: string;
  parent: string;
  desc: string;
  budget: string;
  approval: boolean;
  active: boolean;
}

function initial(c?: ExpenseCategory): Form {
  return c
    ? { name: c.name, color: c.color, parent: c.parent || TOP, desc: c.desc || "", budget: c.budget ? String(c.budget) : "", approval: c.approval, active: c.active }
    : { name: "", color: CATEGORY_SWATCHES[0] ?? "", parent: TOP, desc: "", budget: "", approval: false, active: true };
}

export function CategoryForm({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const cats = useExpenseCategoryList();
  const cat = cats.find((c) => c.name === edit);
  if (edit && !cat) {
    return (
      <Modal open title="Edit category" onClose={onClose} width={640}>
        <div className="type-body text-text-muted">{edit} is not in the list.</div>
      </Modal>
    );
  }
  return <Body key={edit ?? "new"} edit={edit} cat={cat} cats={cats} onClose={onClose} />;
}

function Body({ edit, cat, cats, onClose }: { edit?: string; cat?: ExpenseCategory; cats: ExpenseCategory[]; onClose: () => void }) {
  const [f, setF] = useState<Form>(() => initial(cat));
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Form>) => setF((s) => ({ ...s, ...patch }));
  const name = f.name.trim();
  const taken = !!name && name !== edit && cats.some((c) => c.name.toLowerCase() === name.toLowerCase());
  const parents = [TOP, ...cats.filter((c) => c.name !== edit && !c.parent).map((c) => c.name)];
  const blocked = !name || taken || n(f.budget) < 0;

  const save = async () => {
    if (blocked || busy) return;
    setBusy(true);
    const res = await saveExpenseCategory({ name, color: f.color, parent: f.parent, desc: f.desc, budget: n(f.budget), approval: f.approval, active: f.active }, edit ?? "");
    setBusy(false);
    if (res.ok) onClose();
    else toast(res.message);
  };

  return (
    <Modal
      open
      title={edit ? "Edit category" : "New category"}
      subtitle="Set how this category works and its monthly budget."
      onClose={onClose}
      width={640}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" disabled={blocked || busy} onClick={save}>
            {edit ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input label="Category name" placeholder="For example, Office supplies" value={f.name} onChange={(e) => set({ name: e.target.value })} />
          {taken && <div className="type-small text-danger-text">A category with this name already exists.</div>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="type-label text-text">Colour</span>
          <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2">
            {CATEGORY_SWATCHES.map((col) => {
              const on = f.color === col;
              return (
                <button
                  key={col}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={col}
                  onClick={() => set({ color: col })}
                  className="size-[30px] rounded-full border-[3px]"
                  // Swatch colours are category data (research R5), bound with `style`.
                  style={{ background: col, borderColor: on ? "var(--surface)" : col, boxShadow: on ? `0 0 0 2px ${col}` : "none" }}
                />
              );
            })}
          </div>
        </div>
        <SearchSelect label="Parent category (optional)" options={parents} value={f.parent} onChange={(parent) => set({ parent })} />
        <TextArea id="ec-desc" label="Description (optional)" rows={2} placeholder="Brief description" value={f.desc} onChange={(desc) => set({ desc })} />
        <Input label="Monthly budget limit (KES)" type="number" placeholder="0 means no limit" min="0" value={f.budget} onChange={(e) => set({ budget: e.target.value })} />
        <CheckRow
          checked={f.approval}
          onChange={(approval) => set({ approval })}
          title="Needs approval"
          note="Expenses in this category wait for a manager to approve them before they are paid."
        />
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckRow checked={f.active} onChange={(active) => set({ active })} title="Category is active" note="Inactive categories can't be picked for new expenses." />
        </div>
      </div>
    </Modal>
  );
}
