# Quickstart & Validation: Help Centre

## Run and gates

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner), or as `jane@…` (Cashier) for the role check. The password is any 6 or
more characters. Move with in-app links, because a full page load resets the data.

## Manual validation scenarios

1. **Chat seed (US1)**: Help opens on Ask UzaPro. It shows the "UzaPro assistant" card and the three
   seed messages, with the user's question on the right.
2. **Send (US1)**: type "Where is my stock?" and press Enter. The question appears, followed by "Open
   Reports for the full figures, or search for a record by its ID, for example INV-0355.", and the
   box is cleared. Pressing Send with only spaces adds nothing.
3. **Session (US1)**: go to Dashboard and back to Help. The new messages are still there.
4. **Lists (US2)**:
   - How-to guides lists 3 articles.
   - Help requests lists TKT-1042, TKT-1041 and TKT-1038 with their pills. Deleting TKT-1038 shows
     "TKT-1038 deleted.".
   - Response times shows 88%, 94% and 97%.
5. **New (US2)**: "New" then Create on any Help tab shows "Record created." and adds no row.
6. **Roles**: Jane sees only Ask UzaPro and How-to guides, with no Delete.
7. **No placeholders**: no module in the app shows "Not built yet in this prototype.".
