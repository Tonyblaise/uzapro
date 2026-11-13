# Quickstart: Modular role permissions

**Prerequisites**: `npm install`, then `npm run dev`. Sign in at `http://localhost:3000/login` with
the demo account from the project's seed (`demo@uzapro.com`) as the Owner.

## Validation scenarios

1. **Cards** (US1): open People › Permissions.
   - Four cards appear in this order:

     | Role | Users | Avatars | Summary |
     |---|---|---|---|
     | Owner / Admin | 1 | TB | Can open 21 of 21 modules |
     | Accountant | 2 | MA +1 | Can open 15 of 21 modules |
     | Cashier | 4 | JS +3 | Can open 8 of 21 modules |
     | Store keeper | 3 | GJ +2 | Can open 9 of 21 modules |

   - Before checking, confirm the counts with `moduleSummary` in the unit test, including Profile.
   - Resize to 1440, 1024, 768 and 375px: the grid shows 4, 3, 2 and 1 columns with no sideways
     scrolling.
2. **Edit and save** (US2): Edit role on Cashier.
   - 21 rows show, grouped by sidebar section. Stock shows Read ✓ and Sales shows Write ✓.
   - Pick Procurement › Purchases "Read", then Save. The toast reads "Cashier access saved." and the
     card count goes up by 1.
   - Reopen the dialog: Purchases shows Read. Click Read again (it clears), then Cancel. Purchases
     still shows Read.
3. **Owner locked**: Edit role on Owner / Admin. All rows show Delete ✓ and are disabled, with the
   note "The owner always has full access." Save is disabled.
4. **Read drives visibility** (US3): set Cashier › Stock to none and save.
   - Use Profile to switch to Cashier.
   - Stock is gone from the sidebar and search.
   - `/stock/stock-management` redirects to the dashboard.
   - Asking Uza AI "show low stock" gets the no-access reply.
5. **Write gate**: as the Owner, set Cashier › Sales to Read and save. Switch to Cashier and open
   Sales › All sales:
   - there is no "New sale" button;
   - row menus show only View and Download PDF;
   - `/sales/all-sales?action=new` shows the toast "Your role can only view Sales." and no form.
6. **Delete gate**: the Accountant (seeded at Write on Expenses) opens an expense. It has Edit but no
   Void. As the Owner, set Accountant › Expenses to Delete. Void now appears for the Accountant.
7. **POS gate**: set Cashier › Point of sale to Read. Terminal cards show "View only" and no
   Launch or Open shift button.
8. **Roles CRUD** (US4):
   - Add new role "Supervisor". The card appears and Edit role opens. Give Sales Write and save.
   - Use "…" › Duplicate to make "Supervisor copy". Rename it to "Floor lead". Delete it and
     confirm.
   - Delete on Cashier shows the toast "Move 4 people to another role first."
9. **Reload**: everything returns to the seed.

## Automated checks

```bash
npm run typecheck && npm run lint
npm run test:unit                         # includes tests/unit/permissions.test.ts
npm run build
npx playwright test                       # includes tests/smoke/permissions.spec.ts and responsive rows
```

Expected: everything passes. `navigation.spec.ts` role coverage is unchanged (SC-002). Existing
specs that used Delete or Void as the Accountant, Cashier or Store keeper are updated for research
R2, or switched to the Owner.
