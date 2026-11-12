/** Verbatim port of the design's `UZ_DOCS` (design/canvas/erp-data.js). */

const FIN = "Owner, Accountant",
  ALL = "All staff",
  MGT = "Owner only";

/** [id, name, parent id, access]. "company" is the top level. */
export const FOLDER_ROWS = [
  ["sales", "Sales", "finance", FIN],
  ["purchase", "Purchase", "finance", FIN],
  ["bank", "Bank", "finance", FIN],
  ["misc", "Miscellaneous", "finance", FIN],
  ["sign", "Sign", "company", ALL],
  ["projects", "Projects", "company", ALL],
  ["products", "Products", "company", ALL],
  ["employees", "Employees", "company", MGT],
  ["contracts", "Contracts", "legal", MGT],
  ["registrations", "Registrations", "legal", MGT],
  ["loans", "Loans", "legal", MGT],
  ["insurances", "Insurances", "legal", MGT],
  ["legal", "Legal", "company", MGT],
  ["marketing", "Marketing", "company", ALL],
  ["y2026", "2026", "closing", FIN],
  ["closing", "Annual Closing", "finance", FIN],
  ["taxes", "Taxes", "finance", FIN],
  ["social", "Social", "finance", FIN],
  ["finance", "Finance", "company", FIN],
  ["inbox", "Inbox", "company", ALL],
  ["admin", "Admin", "company", MGT],
] as const;

/** [name, folder id, size in KB, modified, owner, linked record]. Ids are "f{index}". */
export const FILE_ROWS = [
  ["Scanned receipt.jpg", "inbox", 1840, "2026-10-31", "Jane Smith", "—"],
  ["Bank statement Oct 2026.pdf", "bank", 412, "2026-10-31", "Tony Blaise", "—"],
  ["VAT return Oct 2026.pdf", "taxes", 236, "2026-10-30", "Tony Blaise", "—"],
  ["NSSF and SHIF remittance Oct 2026.pdf", "social", 188, "2026-10-29", "Tony Blaise", "—"],
  ["INV-0351.pdf", "sales", 96, "2026-10-28", "Jane Smith", "INV-0351"],
  ["PUR-ORD-0409.pdf", "purchase", 104, "2026-10-27", "Grant Jensen", "PUR-ORD-0409"],
  ["Trial balance Oct 2026.xlsx", "y2026", 64, "2026-10-26", "Tony Blaise", "—"],
  ["Price list Q4.xlsx", "products", 88, "2026-10-20", "Grant Jensen", "—"],
  ["Black Friday campaign brief.docx", "marketing", 52, "2026-10-18", "Jane Smith", "Black Friday"],
  ["Store launch budget.xlsx", "projects", 72, "2026-10-15", "Grant Jensen", "Store launch"],
  ["Eastside supplier agreement.pdf", "contracts", 1320, "2026-09-22", "Tony Blaise", "Eastside Bicycle Supplies"],
  ["Stock and fire policy 2026.pdf", "insurances", 2210, "2026-08-14", "Tony Blaise", "—"],
  ["Asset finance facility.pdf", "loans", 980, "2026-06-03", "Tony Blaise", "—"],
  ["Staff handbook.pdf", "employees", 3120, "2026-03-11", "Tony Blaise", "—"],
  ["Single business permit 2026.pdf", "registrations", 340, "2026-01-19", "Tony Blaise", "—"],
  ["Nairobi HQ lease.pdf", "contracts", 1760, "2025-12-02", "Tony Blaise", "Nairobi HQ"],
  ["KRA PIN certificate.pdf", "registrations", 128, "2024-02-08", "Tony Blaise", "—"],
  ["Certificate of incorporation.pdf", "registrations", 276, "2024-01-15", "Tony Blaise", "—"],
  ["Signed NDA template.pdf", "sign", 144, "2025-07-21", "Tony Blaise", "—"],
] as const;

/** File Manager toolbar options (design `docsView`). */
export const DOC_TYPE_OPTIONS = ["All file types", "Folders", "Images", "Documents", "Spreadsheets", "Starred"] as const;
export const DOC_SORT_OPTIONS = ["Newest first", "Oldest first"] as const;
/** Storage quota per ring: 5 GB in KB. */
export const DOC_QUOTA_KB = 5 * 1024 * 1024;
