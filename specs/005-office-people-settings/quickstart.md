# Quickstart & Validation: Office, People and Settings

## Run and gates

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner). Use `mary@…` (Accountant), `grant@…` (Store keeper) and `jane@…`
(Cashier) for the role checks. The password is any 6 or more characters. After logging in, move
around with in-app links, because a full page load resets the data.

## Manual validation scenarios

1. **Calendar (US1)**:
   - November 2026 shows the seed events: Team meeting on the 12th, VAT return due on the 20th,
     Black Friday SMS on the 24th, and so on. "Coming up" starts with the 1 Nov statement reminder.
   - Add "Supplier visit" on 20 Nov. "Event saved." is shown and the chip appears on the 20th.
2. **Calendar edit and delete (US1)**: edit "Team meeting" to 15:00. Then delete it: "Team meeting
   deleted.".
3. **Calendar roles (US1)**: as Jane (Cashier), "VAT return due" and the other Accounts events are
   hidden.
4. **File Manager (US2)**: create "Receipts" in Finance: "Receipts created in Finance.". Upload a
   file into it: "{name} added to Receipts.".
5. **File Manager search and move (US2)**:
   - Searching "INV-0351" lists the invoice PDF.
   - Moving it to Bank shows "Moved to Bank.".
   - Renaming keeps ".pdf".
6. **Folder delete (US2)**: deleting Legal states its subfolders and files, then shows "Legal
   deleted.".
7. **Business profile (US3)**: the ring shows the missing required details (trading name, KRA PIN).
   Fill both and save: "Business profile saved." and "Profile complete".
8. **Branches (US3)**:
   - Add "Mombasa" with "also create a store" ticked. The success message is shown, and "Mombasa
     Store" appears under Storage locations and Stock › Warehouses.
   - Deleting Nairobi HQ is unavailable.
9. **Terminals (US3)**: with 1 slot in use, adding an active terminal offers "Pay and activate" or
   "Add as inactive". "Add a paid slot" shows "Paid slot added (KES 1,000 a month).".
10. **Branch pickers (FR-013)**: the new branch is offered in the Accounts › New account and Record
    expenses branch pickers.
11. **Profile (US4)**: change the first name to Anthony and save. "Profile saved." is shown and the
    header shows "Anthony Ashiuma". The password rules gate "Update password".
12. **Generic screens (US5)**:
    - Reports › Popular shows 8 cards.
    - Messages › Saved messages: search filters the list, and Delete "Order ready" shows "Order
      ready deleted.".
    - "New" then Create shows "Record created." with no new row.
    - As Mary (Accountant), Delete is not offered.
13. **Roles (FR-017)**: Mary sees Calendar, Reports, Team and File Manager. Grant sees Calendar and
    File Manager. Jane sees Calendar.
