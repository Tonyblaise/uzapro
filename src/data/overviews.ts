/**
 * Fixed overview figures (FR-005, research R9). Synchronous getters for client components and
 * async wrappers matching contracts/data-access.md; both return frozen design values.
 */
import { parseAmount } from "@/lib/format";
import { UZ_HOME, UZ_PRODTREND, UZ_PRODUCTS, UZ_SALES, UZ_STOCK_FIXED } from "./fixtures/overviews";
import { INVOICE_ROWS } from "./fixtures/sales";

/** Invoice analytics computed once from the seed invoice list, as the design does (then frozen). */
function invoiceAnalytics() {
  const by = (label: string) => INVOICE_ROWS.filter((r) => r[4].label === label);
  return (["Overdue", "Pending", "Paid"] as const).map((label) => {
    const rows = by(label);
    return {
      label,
      tone: label === "Overdue" ? ("danger" as const) : label === "Pending" ? ("warning" as const) : ("success" as const),
      count: rows.length,
      amount: rows.reduce((s, r) => s + parseAmount(r[5]), 0),
    };
  });
}

const DASHBOARD = {
  ...UZ_HOME,
  pendingInvoices: INVOICE_ROWS.filter((r) => r[4].label !== "Paid").length,
  invoiceAnalytics: invoiceAnalytics(),
};

export type DashboardData = typeof DASHBOARD;
export type SalesOverviewData = typeof UZ_SALES;
export type ProductsOverviewData = typeof UZ_PRODUCTS & { trend: typeof UZ_PRODTREND };
export type StockOverviewData = typeof UZ_STOCK_FIXED;

export const dashboardData = (): DashboardData => DASHBOARD;
export const salesOverviewData = (): SalesOverviewData => UZ_SALES;
export const productsOverviewData = (): ProductsOverviewData => ({ ...UZ_PRODUCTS, trend: UZ_PRODTREND });
export const stockOverviewData = (): StockOverviewData => UZ_STOCK_FIXED;

export const getDashboard = async () => dashboardData();
export const getSalesOverview = async () => salesOverviewData();
export const getProductsOverview = async () => productsOverviewData();
export const getStockOverview = async () => stockOverviewData();
