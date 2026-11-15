"use client";

import { useState } from "react";
import {
  DEFAULT_PRODUCT_TAX,
  PRODUCT_TAX_OPTIONS,
  addSubCategory,
  createProduct,
  createUnit,
  setProductReorder,
  toast,
  updateProduct,
  useCan,
  useCategories,
  useProductReorder,
  useUnitList,
  validateLevels,
  type Product,
  type ProductImage,
  type ProductTax,
  type Variant, defaultContains } from "@/data";
import { num } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { IconButton } from "@/components/ui/IconButton";
import { Drawer } from "@/components/ui/Overlay";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { CategoryForm } from "./CategoryForm";
import { CRUMB, ImageDrop, marginText } from "./shared";

interface Row {
  id: number;
  name: string;
  cost: string;
  price: string;
  unit: string;
  /** Feature 014: base units in this unit, for a row that prices the variant in another unit. */
  contains: string;
  /** Reorder at / Order up to for this variant, in base units, at every store (variant rows only). */
  min: string;
  max: string;
}

type ProductReorder = { variant: string; min: number; max: number } | "mixed" | null;

let rowSeq = 0;
const blank = (unit: string, name = ""): Row => ({ id: ++rowSeq, name, cost: "", price: "", unit, contains: "", min: "", max: "" });

/** Design `prodEdit`: one row per variant, then one row per extra unit price under it. */
function rowsFor(p: Product, base: string, reorder: ProductReorder): Row[] {
  const rows: Row[] = [];
  for (const v of p.variants) {
    const point = reorder && reorder !== "mixed" && reorder.variant === v.name ? reorder : undefined;
    rows.push({
      ...blank(base),
      name: v.name,
      price: v.price ? String(v.price) : "",
      cost: v.cost ? String(v.cost) : "",
      unit: v.unit || base,
      ...(point ? { min: String(point.min), max: String(point.max) } : {}),
    });
    for (const u of v.extraUnits) rows.push({ ...blank(base), name: v.name, unit: u.unit, price: String(u.price), cost: u.cost ? String(u.cost) : "", contains: String(u.contains) });
  }
  return rows.length ? rows : [blank(base)];
}

const taxRate = (label: string) => Number(label.match(/([\d.]+)%/)?.[1] ?? 0) || 0;

/**
 * Design `isProdNew` (full-width drawer): Product name, Product category (with "New category"),
 * Sub-category (optional), the "Product variants" grid with margin and "+" extra unit prices,
 * Product image (optional), Tax (Sales tax / Purchase tax with "includes tax" switches), Save/Cancel.
 */
export function ProductForm({ open, edit, onClose }: { open: boolean; edit?: Product; onClose: () => void }) {
  if (!open) return null;
  return <ProductFormBody key={edit?.name ?? "new"} edit={edit} onClose={onClose} />;
}

function ProductFormBody({ edit, onClose }: { edit?: Product; onClose: () => void }) {
  const categories = useCategories();
  const units = useUnitList();
  const baseUnit = units[0] ?? "Piece";

  const editCat = edit ? categories.find((c) => c.name === edit.category) : undefined;
  const [name, setName] = useState(edit?.name ?? "");
  const [cat, setCat] = useState(edit ? (editCat?.parent ? editCat.parent : edit.category === "—" ? "" : edit.category) : "");
  const [sub, setSub] = useState(edit && editCat?.parent ? edit.category : "");
  // Reorder points (set per variant, applied at every store) need Write on Stock as well.
  const showReorder = useCan("write", "inv");
  const savedReorder = useProductReorder(edit?.name);
  const [rows, setRows] = useState<Row[]>(() => (edit ? rowsFor(edit, baseUnit, savedReorder) : [blank(baseUnit)]));
  const hasVar = edit ? (edit.hasVariants ?? !(edit.variants.length === 1 && edit.variants[0]?.name === "Standard")) : true;
  const initialTax: ProductTax = edit?.tax ?? {
    sales: edit && !edit.taxable ? "No tax" : DEFAULT_PRODUCT_TAX,
    purchase: DEFAULT_PRODUCT_TAX,
    salesInclusive: false,
    purchaseInclusive: true,
  };
  const [tax, setTax] = useState<ProductTax>(initialTax);
  const [image, setImage] = useState<ProductImage | undefined>(edit?.image);
  const [catDraft, setCatDraft] = useState<string | null>(null);

  const topCategories = categories.filter((c) => !c.parent).map((c) => c.name);
  const subs = ["None", ...categories.filter((c) => c.parent && c.parent === cat).map((c) => c.name)];

  const rowDone = (r: Row) => (!hasVar || !!r.name.trim()) && Number(r.price) > 0;
  const rowBlank = (r: Row) => !(r.name.trim() || r.cost || r.price);
  /** A row that prices a variant already listed above it in another unit (a bulk unit). */
  const isExtra = (r: Row, at: number) => rows.slice(0, at).some((x) => rowDone(x) && (!hasVar || x.name.trim() === r.name.trim()));
  const basePrice = (r: Row) => Number(rows.find((x) => rowDone(x) && (!hasVar || x.name.trim() === r.name.trim()))?.price) || 0;
  const containsBad = (r: Row) => r.contains !== "" && !(Number.isInteger(Number(r.contains)) && Number(r.contains) >= 1);
  // Reorder point: the first variant row with values is used (stock is counted per product, not per variant).
  const reorderRows = showReorder ? rows.filter((r, i) => !isExtra(r, i) && (r.min !== "" || r.max !== "")) : [];
  const reorderRow = reorderRows[0];
  const reorderError = reorderRows.reduce<string | null>(
    (e, r) => e ?? (r.min === "" || r.max === "" ? "Enter both Reorder at and Order up to, or leave both blank" : validateLevels(Number(r.min), Number(r.max))),
    null,
  );
  const variantName = (r: Row) => (hasVar ? r.name.trim() : "Standard");
  const reorderKey = reorderRow ? `${variantName(reorderRow)}|${Number(reorderRow.min)}|${Number(reorderRow.max)}` : "";
  const [initialReorderKey] = useState(reorderKey);
  const blocked =
    !name.trim() || !cat || !rows.some(rowDone) || rows.some((r) => !rowBlank(r) && !rowDone(r)) || rows.some((r, i) => isExtra(r, i) && containsBad(r)) || !!reorderError;

  const setRow = (id: number, key: keyof Row, val: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: val } : r)));

  const save = async () => {
    if (blocked) return;
    const variants: Variant[] = [];
    for (const r of rows.filter(rowDone)) {
      const vName = hasVar ? r.name.trim() : "Standard";
      const unit = r.unit || baseUnit;
      const hit = variants.find((v) => v.name === vName);
      // A blank "Contains" is 0 here; the command defaults it from the price ratio.
      if (hit) hit.extraUnits.push({ unit, price: Number(r.price), cost: Number(r.cost) || 0, contains: Number(r.contains) || 0 });
      else variants.push({ name: vName, price: Number(r.price), cost: Number(r.cost) || 0, unit, extraUnits: [] });
    }
    const input = {
      name,
      category: sub || cat,
      taxable: tax.sales !== "No tax" && taxRate(tax.sales) > 0,
      tax,
      hasVariants: hasVar,
      variants,
      ...(image ? { image } : {}),
    };
    const res = edit ? await updateProduct(edit.name, input) : await createProduct(input);
    if (!res.ok) {
      toast(res.message);
      return;
    }
    // Only touch reorder points when the fields changed, so a store tuned in Stock › Reorder survives
    // an unrelated product edit.
    if (showReorder && reorderKey !== initialReorderKey) {
      const point = reorderRow ? { variant: variantName(reorderRow), min: Number(reorderRow.min), max: Number(reorderRow.max) } : null;
      const r = await setProductReorder(res.value.name, point);
      if (!r.ok) toast(r.message);
    }
    onClose();
  };

  const taxNote =
    tax.sales === "No tax"
      ? "No tax is added when you sell this product."
      : tax.salesInclusive
        ? `Prices you enter already include ${tax.sales}. Receipts show the tax inside the price.`
        : `${tax.sales} is added on top of the selling price${taxRate(tax.sales) ? ` (KES 1,000 becomes KES ${num(1000 * (1 + taxRate(tax.sales) / 100))})` : ""}.`;

  const taxFields = [
    { label: "Sales tax", value: tax.sales, inc: tax.salesInclusive, incLabel: "Selling price includes tax", set: (v: string) => setTax((t) => ({ ...t, sales: v })), toggle: () => setTax((t) => ({ ...t, salesInclusive: !t.salesInclusive })) },
    { label: "Purchase tax", value: tax.purchase, inc: tax.purchaseInclusive, incLabel: "Buying price includes tax", set: (v: string) => setTax((t) => ({ ...t, purchase: v })), toggle: () => setTax((t) => ({ ...t, purchaseInclusive: !t.purchaseInclusive })) },
  ];

  if (catDraft !== null) {
    return (
      <CategoryForm
        open
        initialName={catDraft}
        onClose={() => setCatDraft(null)}
        onSaved={(n) => {
          setCat(n);
          setSub("");
          setCatDraft(null);
        }}
      />
    );
  }

  const grid = showReorder
    ? "grid grid-cols-[minmax(130px,1fr)_130px_140px_88px_130px_58px_96px_96px_30px_30px] items-center gap-2"
    : "grid grid-cols-[minmax(130px,1fr)_140px_150px_96px_140px_58px_30px_30px] items-center gap-2";

  return (
    <Drawer open title={edit ? "Edit product" : "New product"} subtitle={CRUMB} width={9999} onClose={onClose}>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          <Input label="Product name" placeholder="Enter a name" value={name} onChange={(e) => setName(e.target.value)} />
          <SearchSelect
            label="Product category"
            noun="category"
            options={topCategories}
            value={cat}
            onChange={(v) => {
              setCat(v);
              setSub("");
            }}
            onNew={(typed) => setCatDraft(typed)}
          />
          {cat && (
            <SearchSelect
              label="Sub-category (optional)"
              noun="sub-category"
              options={subs}
              value={sub || "None"}
              onChange={(v) => setSub(v === "None" ? "" : v)}
              onCreate={(n) => addSubCategory(n, cat)}
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="type-label text-text">Product variants</span>
          <div className="overflow-x-auto">
            <div className={`flex ${showReorder ? "min-w-[900px]" : "min-w-[700px]"} flex-col gap-2`}>
              <div className={`${grid} type-table-head border-b border-border pb-2 text-text-muted`}>
                <span>Variant</span>
                <span className="text-right">Base buying price</span>
                <span>Unit of measure</span>
                <span className="text-right">Contains</span>
                <span className="text-right">Base selling price</span>
                <span className="text-right">Margin</span>
                {showReorder && (
                  <>
                    <span className="text-right">Reorder at</span>
                    <span className="text-right">Order up to</span>
                  </>
                )}
                <span />
                <span />
              </div>
              {rows.map((r, at) => (
                <div key={r.id} className={grid}>
                  {hasVar ? (
                    <Input size="sm" aria-label="Variant name" placeholder="Size 42" value={r.name} onChange={(e) => setRow(r.id, "name", e.target.value)} />
                  ) : (
                    <span className="type-small text-text-muted">Standard</span>
                  )}
                  <Input size="sm" aria-label="Cost in KES" type="number" min={0} value={r.cost} onChange={(e) => setRow(r.id, "cost", e.target.value)} />
                  <SearchSelect noun="unit" options={units} value={r.unit} onChange={(v) => setRow(r.id, "unit", v)} onCreate={(n) => (void createUnit(n, { silent: true }), n)} />
                  {isExtra(r, at) ? (
                    <Input
                      size="sm"
                      aria-label="Base units in this unit"
                      type="number"
                      min={1}
                      step={1}
                      placeholder={String(defaultContains(basePrice(r), Number(r.price)))}
                      value={r.contains}
                      onChange={(e) => setRow(r.id, "contains", e.target.value)}
                    />
                  ) : (
                    <span className="type-small text-right text-text-muted">Base unit</span>
                  )}
                  <Input size="sm" aria-label="Price in KES" type="number" min={0} value={r.price} onChange={(e) => setRow(r.id, "price", e.target.value)} />
                  <span className="type-small u-num text-right text-text-muted">{marginText(Number(r.cost), Number(r.price))}</span>
                  {showReorder &&
                    (isExtra(r, at) ? (
                      <>
                        <span />
                        <span />
                      </>
                    ) : (
                      <>
                        <Input size="sm" aria-label="Reorder at" type="number" min={0} step={1} value={r.min} onChange={(e) => setRow(r.id, "min", e.target.value)} />
                        <Input size="sm" aria-label="Order up to" type="number" min={1} step={1} value={r.max} onChange={(e) => setRow(r.id, "max", e.target.value)} />
                      </>
                    ))}
                  <IconButton
                    icon="plus"
                    size="sm"
                    label="Add a price in another unit"
                    onClick={() =>
                      setRows((rs) => {
                        const at = rs.findIndex((x) => x.id === r.id);
                        const next = rs.slice();
                        next.splice(at + 1, 0, blank("", r.name));
                        return next;
                      })
                    }
                  />
                  <IconButton icon="trash-2" size="sm" label="Remove variant" disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} />
                </div>
              ))}
            </div>
          </div>
          {hasVar && (
            <div>
              <Button variant="secondary" size="sm" icon="plus" onClick={() => setRows((rs) => [...rs, blank(baseUnit)])}>
                Add variant
              </Button>
            </div>
          )}
          <span className="type-caption text-text-muted">Each product needs at least one price. Use + to price it in another unit, and say how many base units it contains: stock is counted in the base unit.</span>
          {showReorder && (
            <span className="type-caption text-text-muted">
              Reorder at and Order up to are in the base unit and apply at every store you buy stock into. Leave them blank for no reorder point. Change one store, the order unit or the supplier in Stock › Reorder.
            </span>
          )}
          {showReorder && savedReorder === "mixed" && reorderKey === initialReorderKey && (
            <span className="type-caption text-text-muted">Reorder points differ by store. Edit them in Stock › Reorder, or enter values here to set every store the same.</span>
          )}
          {reorderRows.length > 1 && !reorderError && (
            <span className="type-caption text-warning-text">Stock is counted per product, so only {variantName(reorderRows[0]!) || "the first variant"}’s reorder point is used.</span>
          )}
          {reorderError && (
            <span role="alert" className="type-small text-danger-text">
              {reorderError}
            </span>
          )}
        </div>

        <ImageDrop label="Product image (optional)" image={image} onChange={setImage} mode="dataUrl" />

        <div className="flex flex-col gap-2">
          <span className="type-label text-text">Tax</span>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {taxFields.map((tx) => {
              const none = tx.value === "No tax";
              const on = !none && tx.inc;
              return (
                <div key={tx.label} className="flex flex-col gap-2">
                  <SearchSelect label={tx.label} options={PRODUCT_TAX_OPTIONS} value={tx.value} onChange={tx.set} />
                  <div className="flex items-center justify-between gap-3">
                    <span className="type-small text-text">{tx.incLabel}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={tx.incLabel}
                      disabled={none}
                      onClick={tx.toggle}
                      className={`flex h-6 w-11 flex-none cursor-pointer rounded-xl border-0 p-0.5 disabled:cursor-not-allowed ${on ? "justify-end bg-action" : "justify-start bg-neutral"} ${none ? "opacity-50" : ""}`}
                    >
                      <span className="size-5 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="type-caption text-text-muted">{taxNote}</span>
        </div>

        <div className="flex gap-2">
          <Button disabled={blocked} onClick={save}>
            Save
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
