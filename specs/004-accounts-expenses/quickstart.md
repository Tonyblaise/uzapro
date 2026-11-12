# Quickstart & Validation: Accounts and Expenses

## Run and gates

The same commands as earlier features:

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner) or `mary@…` (Accountant). The password is any 6 or more characters.
Move with in-app links after login, because a full page load resets the data.

## Manual validation scenarios

1. **Balances (US1)**: Bank accounts shows Equity Bank — Main 4,812,300, M-Pesa Till 386,450 and
   Cash drawer 24,600. Transactions lists 10 entries, newest first; filtering by M-Pesa Till shows
   TRN-0031 −250,000, DEP-0217 +18,450 and WDL-0103 −42,300.
2. **Deposit (US2)**: 10,000 into Cash drawer gives "Deposit saved.", DEP-0219 Cleared, and Cash
   drawer 34,600.
3. **Withdrawal (US2)**: 5,000 from M-Pesa Till gives "Withdrawal saved.", WDL-0105 Completed, and
   M-Pesa Till 381,450.
4. **Transfer (US2)**: 50,000 from M-Pesa Till to Equity Bank — Main gives "Transfer saved.",
   TRN-0032, M-Pesa Till 336,450 and Equity 4,862,300, plus two TRN-0032 lines in Transactions.
5. **Expense (US3)**: record Transport 2,000 from Cash drawer. The toast reads "1 paid.", EXP-0044
   is Paid, and Cash drawer drops by 2,000.
6. **Approval (US3)**: approve EXP-0043. The toast reads "EXP-0043 approved and paid from M-Pesa
   Till.", and M-Pesa Till drops by 6,500.
7. **Bill (US3)**: record an expense "later" for Kenya Power, 3,000. The toast reads "1 added to
   Payables.". Payables lists a "Bill" with doc EXP-0044 (the next number in a fresh session). Paying
   it in Payables marks EXP-0044 Paid.
8. **Void (US3)**: void EXP-0040 with a reason. The toast reads "EXP-0040 voided. Money returned to
   Cash drawer.", Cash drawer rises by 18,650, and the expense is listed in Voided.
9. **Recurring (US4)**: "Record now" on REC-0002 gives "EXP-00xx recorded from Office internet."
   and the next date advances. A new schedule gives "Set up {name} (REC-0004).".
10. **Categories (US4)**: create a category "Marketing", budget 20,000. The toast reads "Marketing
    created." and the category is listed.
11. **Payments (US6)**: pay RCV-0011 (1,026) into Equity Bank — Main. Equity rises by 1,026 and
    Transactions shows "Payment from Blazing Cycle Trails".
12. **Overview (US5)**: the KPIs, trend and category breakdown match the canvas.
13. **Roles**: the Cashier and Store keeper see neither module.
