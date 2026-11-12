"use client";
/** Extra read data for the sales feature (owned by that story phase). */

/** Staff who can carry a sales target (design: Settings › Staff logins, `UZ_MODS.set`). */
export const SALES_STAFF = ["Tony Ashiuma", "Grant Jensen", "Mary Achieng", "Jane Smith"] as const;

/** Branches a target can apply to (design `UZ_BRANCHES` names). */
export const TARGET_BRANCHES = ["Nairobi HQ", "Import"] as const;
