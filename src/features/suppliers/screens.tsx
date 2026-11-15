import { CreditList, IssueCreditButton } from "@/features/receivables";
import type { ScreenMap } from "../types";
import { NewSupplierAction, SupplierList } from "./SupplierList";

const SupplierCredits = () => <CreditList side="pay" />;
const IssueSupplierCredit = () => <IssueCreditButton side="pay" />;

/** Tab slug → screen for Suppliers (feature 002, US5). Supplier credits moved here from Payables. */
export const suppliersScreens: ScreenMap = {
  suppliers: { Body: SupplierList, Actions: NewSupplierAction },
  "supplier-credits": { Body: SupplierCredits, Actions: IssueSupplierCredit },
};
