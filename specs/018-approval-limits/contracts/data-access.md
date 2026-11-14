# Contract: data access (approvals)

```ts
// src/data/approvals.ts
export const FULL_APPROVALS: RoleApprovals;  export const NO_APPROVALS: RoleApprovals;
export const APPROVAL_LABEL: Record<"credit" | "counts" | "dispatch", string>;
export function seedApprovals(): Record<string, RoleApprovals>;
export function approvalsFor(s, key: string): RoleApprovals;
export function myApprovals(s): RoleApprovals;                      // the signed-in role's
export function discountGiven(before: number, discount: number): number;   // percent, 1 decimal
export function discountBlock(max: number, before: number, discount: number): string | null;
export function validDiscountMax(n: number): boolean;

// commands
saveRoleAccess(key, access, approvals?): Promise<Result<void>>;
```

Messages: "Your role can't approve stock counts.", "Your role can't dispatch sales orders.",
"Your role can give discounts up to {max}%. This one is {given}%.",
"Enter a discount limit from 0 to 100".
