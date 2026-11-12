"use client";
/**
 * Mounts the Expenses overlay the URL asks for (contracts/routes.md): `?action=new` opens the tab's
 * form, `?view=<EXP>` the expense view (`&step=void` the void dialog), `?view=<REC>` the recurring
 * form and, on Expense categories, `?view=<name>` the category form.
 */
import { CategoryForm } from "./CategoryForm";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseView } from "./ExpenseView";
import { RecurringForm } from "./RecurringForm";
import { VoidExpenseForm } from "./VoidExpenseForm";
import { useExpenseOverlay } from "./shared";

export function ExpenseOverlays({ create }: { create?: "expense" | "recurring" | "category" }) {
  const { params, open, close } = useExpenseOverlay();
  const action = params.get("action");
  const view = params.get("view");
  const step = params.get("step");

  if (action === "new") {
    if (create === "expense") return <ExpenseForm onClose={close} />;
    if (create === "recurring") return <RecurringForm onClose={close} />;
    if (create === "category") return <CategoryForm onClose={close} />;
    return null;
  }
  if (!view) return null;
  if (view.startsWith("EXP-")) {
    if (step === "void") return <VoidExpenseForm key={view} refId={view} onClose={close} />;
    return <ExpenseView key={view} refId={view} onClose={close} onVoid={() => open({ view, step: "void" })} />;
  }
  if (view.startsWith("REC-")) return <RecurringForm key={view} edit={view} onClose={close} />;
  if (create === "category") return <CategoryForm key={view} edit={view} onClose={close} />;
  return null;
}
