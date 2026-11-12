# Quickstart & Validation: Help Center Articles

## Run and gates

```bash
npm run dev
npm run typecheck && npm run lint && npm run build && npm run test:unit && npm run test:smoke
```

Log in as `tony@…` (Owner), or as `jane@…` (Cashier) for the role checks. The password is any 6 or
more characters.

## Manual validation scenarios

1. **Landing (US1)**: Help opens on Help Center, with no tab strip and no header button. The sidebar
   lists Getting started, Selling, Stock and products, Buying, Money and Settings. The main area
   shows "UzaPro Help Center", its subtitle, the search box and the hint.
2. **Browse (US1)**:
   - Expand Selling, then Invoices and quotations, and open "Sending an invoice and recording its
     payment".
   - The breadcrumbs read Help Center › Selling › Invoices and quotations › the article. Below them
     are the title, "Updated … ago", the sections and the outline.
   - The article and Selling are highlighted.
3. **Outline (US1)**: choose an outline entry. The page scrolls to that heading.
4. **Deep link (US1)**: open `/help/help-center?article=how-to-give-a-refund` directly. The article
   opens with Selling expanded. `?article=nope` shows the landing page with "That article was not
   found.".
5. **Landing search (US2)**: type "refund". "How to give a refund" is listed first with its category
   path and a snippet. Choosing it opens the article. "zzz" shows "No articles match that search.".
6. **Top search (US2, Q4)**: on the Help Center, type "transfer" in the top search bar. The same
   results appear, including "Moving stock between stores".
7. **Sidebar filter (US2)**: select the sidebar search icon and type "deposit". Only "Recording a
   deposit" and its category Money remain. Clearing the field restores the tree.
8. **Screen links (US3)**: in "How to give a refund", follow the link to Sales › Refunds (credit
   notes); that screen opens. As Jane (Cashier), a link to Accounts shows as plain text.
9. **Phone**: at 390px the categories sit in a "Browse categories" disclosure, the outline is hidden,
   and the page doesn't scroll sideways.
10. **Roles**: every role sees Help › Help Center.
