# Data model: Approval rights and discount limits

`RoleApprovals` (`types/permissions.ts`): `credit`, `counts`, `dispatch` (booleans),
`discountMax` (whole number 0–100). `PermissionsState.approvals: Record<roleKey, RoleApprovals>`.

| Role | credit | counts | dispatch | discountMax |
|---|---|---|---|---|
| Owner / Admin (locked) | on | on | on | 100 |
| Accountant | on | off | on | 20 |
| Cashier | off | off | off | 5 |
| Store keeper | off | off | off | 0 |
| New role | off | off | off | 0 |
