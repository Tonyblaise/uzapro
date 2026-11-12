"use client";
/**
 * Header actions of Expenses (design `headerActions` for `exp`): "New recurring expense" on
 * Recurring, "New category" on Expense categories, none on Voided and "Record expenses" elsewhere.
 */
import { Button } from "@/components/ui/Button";
import { useExpenseOverlay } from "./shared";

function NewAction({ children }: { children: string }) {
  const { open } = useExpenseOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action: "new" })}>
      {children}
    </Button>
  );
}

export const RecordExpensesAction = () => <NewAction>Record expenses</NewAction>;
export const NewRecurringAction = () => <NewAction>New recurring expense</NewAction>;
export const NewCategoryAction = () => <NewAction>New category</NewAction>;
