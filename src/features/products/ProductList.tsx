"use client";

import { useMemo, useState } from "react";
import { deleteProduct, useCategories, useProducts, useRole, type ProductRow } from "@/data";
import { num } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions } from "@/components/ui/Menu";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProductForm } from "./ProductForm";
import { ProductRecord } from "./ProductRecord";
import { categoryPath, variantPrice } from "./derive";
import { RowConfirm, Thumbed, useOverlayParams } from "./shared";

interface Row {
  product: ProductRow;
  name: string;
  category: string;
  variants: number;
  price: string;
  onHand: string;
  status: string;
}

/**
 * All products tab (design table post-processing): Product (thumb), Category ("Parts › Frames"),
 * Variants, Price, On hand, Status, then row actions View / Delete.
 */
export function ProductList() {
  const products = useProducts();
  const categories = useCategories();
  const role = useRole();
  const { action, view, get, open, close } = useOverlayParams();
  const [confirm, setConfirm] = useState<string | null>(null);
  const canDelete = !role.tabs;

  const rows = useMemo<Row[]>(
    () =>
      products.map((p) => ({
        product: p,
        name: p.name,
        category: categoryPath(p.category, categories),
        variants: p.variants.length,
        price: variantPrice(p),
        onHand: num(p.onHand),
        status: p.status.label,
      })),
    [products, categories],
  );

  const columns: DataColumn<Row>[] = [
    { key: "name", title: "Product", render: (r) => <ProductThumb product={r.product} /> },
    { key: "category", title: "Category" },
    { key: "variants", title: "Variants", numeric: true },
    { key: "price", title: "Price", numeric: true },
    { key: "onHand", title: "On hand", numeric: true },
    { key: "status", title: "Status", render: (r) => <StatusPill tone={r.product.status.tone}>{r.status}</StatusPill> },
    {
      key: "actions",
      title: "",
      numeric: true,
      width: 48,
      text: () => "",
      render: (r) => (
        <RowActions
          items={[
            { label: "View", onClick: () => open({ view: r.name }) },
            ...(canDelete ? [{ label: "Delete", danger: true, onClick: () => setConfirm(r.name) }] : []),
          ]}
        />
      ),
    },
  ];

  const editName = get("edit");
  const editing = editName ? products.find((p) => p.name === editName) : undefined;

  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} onRowClick={(r) => open({ view: r.name })} noun="record" />
      <ProductOverlays action={action} view={editing ? null : view} editing={editing} open={open} close={close} />
      <RowConfirm
        name={confirm}
        onClose={() => setConfirm(null)}
        onDelete={() => {
          if (confirm) void deleteProduct(confirm);
          setConfirm(null);
        }}
      />
    </>
  );
}

/** New product form, product record and edit form, driven by the URL. */
export function ProductOverlays({
  action,
  view,
  editing,
  open,
  close,
}: {
  action: string | null;
  view: string | null;
  editing?: ProductRow;
  open: (p: Record<string, string>) => void;
  close: () => void;
}) {
  return (
    <>
      <ProductForm open={action === "new" || !!editing} edit={editing} onClose={close} />
      <ProductRecord name={view} onClose={close} onEdit={() => view && open({ edit: view })} />
    </>
  );
}

function ProductThumb({ product }: { product: ProductRow }) {
  return <Thumbed name={product.name} image={product.image} />;
}

export function ProductActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New product
    </Button>
  );
}
