/**
 * The ONLY public entry to data for UI code (Constitution Principle II, contracts/data-access.md).
 * Fixtures and the store are private to src/data.
 */
export * from "./types";
export * from "./queries";
export * from "./queries-dashboard";
export * from "./queries-sales";
export * from "./queries-products";
export * from "./queries-stock";
export * from "./queries-purchases";
export * from "./overviews";
export * from "./commands/session";
export * from "./commands/catalog";
export * from "./commands/stock";
export * from "./commands/sales";
export * from "./commands/customers";
export * from "./commands/suppliers";
export * from "./commands/purchases";
export { StoreProvider } from "./store/StoreProvider";

// Reference lists the forms need (read-only copies).
export { UZ_UNITS, UZ_PAYMETHODS, PAY_LATER, UZ_REFUND, UZ_VOID, UZ_LOC, UZ_BIZ } from "./fixtures/reference";
export { WALK_IN } from "./fixtures/customers";
