import type { ScreenMap } from "../types";
import { NewCategoryAction, NewRecurringAction, RecordExpensesAction } from "./Actions";
import { CategoryList } from "./CategoryList";
import { ExpenseList } from "./ExpenseList";
import { ExpensesOverview } from "./ExpensesOverview";
import { RecurringList } from "./RecurringList";
import { VoidedList } from "./VoidedList";

/**
 * Tab slug → screen (feature 004, Expenses). Header actions follow the design's `headerActions`
 * for `exp`: "Record expenses" on Overview and Expenses, "New recurring expense", none on Voided,
 * "New category".
 */
export const expensesScreens: ScreenMap = {
  overview: { Body: ExpensesOverview, Actions: RecordExpensesAction },
  expenses: { Body: ExpenseList, Actions: RecordExpensesAction },
  recurring: { Body: RecurringList, Actions: NewRecurringAction },
  voided: { Body: VoidedList },
  "expense-categories": { Body: CategoryList, Actions: NewCategoryAction },
};
