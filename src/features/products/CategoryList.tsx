"use client";

import { useMemo, useState } from "react";
import { canDeleteCategory, deleteCategory, toast, useCategories, useProducts, type Category, useCan } from "@/data";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { RowActions, type MenuItem } from "@/components/ui/Menu";
import { CategoryForm } from "./CategoryForm";
import { RowConfirm, Thumbed, useOverlayParams } from "./shared";

interface CategoryRow {
  category: Category;
  name: string;
  parentText: string;
  description: string;
  products: number;
}

/**
 * Categories tab (design table post-processing): columns Category (thumb), Parent category,
 * Description, Products. Top-level rows are each followed by their sub-categories.
 */
export function CategoryList() {
  const categories = useCategories();
  const products = useProducts();
  const { action, view, get, open, close } = useOverlayParams();
  const [confirm, setConfirm] = useState<string | null>(null);
  const canDelete = useCan("delete");

  const rows = useMemo<CategoryRow[]>(() => {
    const tops = categories.filter((c) => !c.parent);
    const orphans = categories.filter((c) => c.parent && !categories.some((x) => x.name === c.parent));
    const ordered = [...tops, ...orphans].flatMap((c) => [c, ...categories.filter((x) => x.parent === c.name)]);
    return ordered.map((c) => {
      const subs = categories.filter((x) => x.parent === c.name).map((x) => x.name);
      const count = products.filter((p) => p.category === c.name || subs.includes(p.category)).length;
      return {
        category: c,
        name: c.name,
        parentText: c.parent ? c.parent : subs.length ? `${subs.length} sub-${subs.length === 1 ? "category" : "categories"}` : "Top level",
        description: c.description || "—",
        products: count,
      };
    });
  }, [categories, products]);

  const items = (r: CategoryRow): MenuItem[] => [
    { label: "Edit", onClick: () => open({ view: r.name }) },
    ...(!r.category.parent ? [{ label: "Add sub-category", icon: "plus", onClick: () => open({ action: "new", parent: r.name }) }] : []),
    ...(canDelete
      ? [
          {
            label: "Delete",
            danger: true,
            onClick: () => {
              const check = canDeleteCategory(r.name);
              if (!check.ok) toast(check.message);
              else setConfirm(r.name);
            },
          },
        ]
      : []),
  ];

  const columns: DataColumn<CategoryRow>[] = [
    {
      key: "name",
      title: "Category",
      render: (r) => <Thumbed name={r.name} image={r.category.image} />,
    },
    { key: "parentText", title: "Parent category" },
    { key: "description", title: "Description" },
    { key: "products", title: "Products", numeric: true },
    { key: "actions", title: "", numeric: true, width: 48, text: () => "", render: (r) => <RowActions items={items(r)} /> },
  ];

  const editing = view ? categories.find((c) => c.name === view) : undefined;
  const creating = action === "new";

  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.name} onRowClick={(r) => open({ view: r.name })} noun="record" />
      <CategoryForm open={creating || !!editing} edit={editing} initialParent={creating ? (get("parent") ?? "") : ""} onClose={close} onSaved={close} />
      <RowConfirm
        name={confirm}
        onClose={() => setConfirm(null)}
        onDelete={async () => {
          if (confirm) {
            const res = await deleteCategory(confirm);
            if (!res.ok) toast(res.message);
          }
          setConfirm(null);
        }}
      />
    </>
  );
}

export function CategoryActions() {
  const { open } = useOverlayParams();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      New category
    </Button>
  );
}
