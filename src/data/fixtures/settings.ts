/**
 * Verbatim port of the design's business structure and profile seeds (design/canvas/erp-data.js:
 * `UZ_BIZ`, `UZ_GROUPS`, `UZ_BRANCHES`, `UZ_LOCPOS`, `UZ_TERMS`, `UZ_LOC`, `UZ_NATIONS`) and the
 * option lists of the Settings and Profile forms (Uzapoint ERP.dc.html `sm` and `pf`).
 */
import type { BizRequirement, Branch, BusinessProfile, Group, TerminalsState } from "../types";

export const UZ_BIZ_FULL: BusinessProfile = {
  name: "Build by Blaise",
  logo: "",
  trading: "",
  type: "Retail",
  industry: "Bicycles & Accessories",
  staff: "1 - 5 staff",
  email: "info@buildbyblaise.co.ke",
  phone: "+254 722 410 233",
  whatsapp: "",
  website: "",
  location: "Nairobi HQ",
  address: "Nairo Court, Mirema Drive",
  city: "Nairobi",
  postal: "",
  pin: "",
  regNo: "",
  regDate: "",
  channels: "In-store and online",
  customers: "Walk-in customers and businesses",
};

export const UZ_GROUPS: readonly Group[] = [{ name: "Administration", parent: "", code: "BBL-GRP-001" }];

export const UZ_BRANCHES: readonly Branch[] = [
  {
    name: "Nairobi HQ",
    code: "BBL-BRN-001",
    group: "Administration",
    phone: "+254 722 410 233",
    email: "hq@buildbyblaise.co.ke",
    city: "Nairobi",
    address: "Nairo Court, Mirema Drive",
    hq: true,
  },
  { name: "Import", code: "BBL-BRN-002", group: "Administration", phone: "", email: "", city: "Mombasa", address: "Kilindini Port", hq: false },
];

/** `UZ_LOC.branches`: merged into the branches at seed time, as the design's `setSync` does. */
export const UZ_LOC_BRANCHES = ["Nairobi HQ", "Import"] as const;

/** Storage location types (`UZ_LOC.types`); the dialogs can add more. */
export const UZ_LOC_TYPES = ["Store", "Manufacturing", "Retail", "Transfer"] as const;

export const UZ_LOCPOS: Readonly<Record<string, boolean>> = { "Point of Sale": true, "Main Store": true };

export const UZ_TERMS: TerminalsState = {
  included: 1,
  purchased: 0,
  price: 1000,
  list: [{ id: 1, name: "Terminal 1", code: "BBL-TRM-001", branch: "Nairobi HQ", store: "Point of Sale", active: true, added: "22 Oct 2026", main: true }],
};

/** The date the design stamps on new terminals (`setTermAdd`). */
export const TERMINAL_ADDED = "10 Nov 2026";

/** The 10 required details of the completion ring (design `bp.req`): [key, label, section]. */
export const BIZ_REQUIRED: readonly BizRequirement[] = [
  { key: "name", label: "Business name", section: "all" },
  { key: "trading", label: "Trading name", section: "all" },
  { key: "type", label: "Business type", section: "business" },
  { key: "industry", label: "Industry", section: "registration" },
  { key: "email", label: "Email", section: "contact" },
  { key: "phone", label: "Phone", section: "contact" },
  { key: "location", label: "Main branch", section: "location" },
  { key: "address", label: "Address", section: "location" },
  { key: "city", label: "City", section: "location" },
  { key: "pin", label: "KRA PIN", section: "registration" },
];

/** Business profile modal option lists (design `sm` for kind 'biz'). */
export const BIZ_TYPES = ["Retail", "Wholesale", "Retail and wholesale", "Manufacturing", "Services", "Restaurant or hospitality"] as const;
export const BIZ_INDUSTRIES = [
  "Bicycles & Accessories",
  "Electronics & Computers",
  "Fashion & Clothing",
  "Food & Beverage",
  "Hardware & Building",
  "Health & Beauty",
  "Agriculture",
  "Other",
] as const;
export const BIZ_STAFF_SIZES = ["Just me", "1 - 5 staff", "6 - 20 staff", "21 - 50 staff", "More than 50 staff"] as const;
export const BIZ_CHANNELS = ["In-store", "Online", "In-store and online", "Field sales", "Wholesale orders"] as const;
export const BIZ_CUSTOMERS = ["Walk-in customers", "Businesses", "Walk-in customers and businesses", "Government and institutions"] as const;

/** Business profile modal titles per section. */
export const BIZ_SECTION_TITLES = {
  all: "Edit business profile",
  contact: "Edit contact details",
  location: "Edit location",
  registration: "Edit registration",
  business: "Edit how you sell",
} as const;

/** City options of the Settings and Profile forms (both can add new towns). */
export const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Kiambu", "Machakos", "Nyeri", "Malindi"] as const;

/** Profile "Country" options (`UZ_NATIONS`). */
export const COUNTRIES = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "South Africa", "China", "India", "United Arab Emirates"] as const;

/** Profile defaults from the design's `_profiles` seed (name split from `UZ_ROLES`). */
export const PROFILE_DEFAULTS = { phone: "+254 722 410 233", country: "Kenya", city: "Nairobi", address: "", photo: "" } as const;
export const PROFILE_EMAIL_DOMAIN = "@buildbyblaise.co.ke";

/** The explainer strip above Branches, Location groups and Storage locations (design `structHelp`). */
export const STRUCT_HELP = [
  { title: "Location groups", text: 'Regions or parts of the business, like "Nairobi region". Every branch belongs to a group.', tab: "location-groups" },
  { title: "Branches", text: "Your actual shops or offices. One of them is the headquarters.", tab: "branches" },
  { title: "Storage locations", text: "Stores and shelves inside a branch where stock is kept. Turn on POS to sell from them.", tab: "storage-locations" },
] as const;

/** Password rule chips (design `pw.rules`). */
export const PASSWORD_RULES: readonly { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (x) => x.length >= 8 },
  { label: "An uppercase letter", test: (x) => /[A-Z]/.test(x) },
  { label: "A lowercase letter", test: (x) => /[a-z]/.test(x) },
  { label: "A number", test: (x) => /\d/.test(x) },
  { label: "A symbol", test: (x) => /[^A-Za-z0-9]/.test(x) },
];
