import { CreditList, IssueCreditButton } from "@/features/receivables";
import type { ScreenMap } from "../types";
import { AddSupplierCreditAction, SupplierCreditList } from "./SupplierCreditList";
import { NewSupplierAction, SupplierList } from "./SupplierList";

const SupplierCreditNotes = () => <CreditList side="pay" />;
const IssueSupplierCredit = () => <IssueCreditButton side="pay" />;

/**
 * Tab slug → screen for Suppliers (feature 002, US5). Supplier credits is the credit suppliers
 * give the business; Supplier credit notes (moved from Payables) is what suppliers owe it back.
 */
export const suppliersScreens: ScreenMap = {
  suppliers: { Body: SupplierList, Actions: NewSupplierAction },
  "supplier-credits": { Body: SupplierCreditList, Actions: AddSupplierCreditAction },
  "supplier-credit-notes": { Body: SupplierCreditNotes, Actions: IssueSupplierCredit },
};
