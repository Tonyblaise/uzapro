# Quickstart: Uza AI

## Prerequisites

1. Run `npm run dev -- -p 3001`.
2. Sign in as demo@uzapro.com / demo@123. This logs you in as the Owner. Use "View as" in the user
   menu to switch roles.

## Scenarios

1. **Launcher**: on the Dashboard, a round green sparkles button sits in the bottom-right corner.
   Hovering shows "Open Uza AI". Select it.
   - The panel opens on a new empty chat, with "Chat with Uza AI" and the four chips.
   - The launcher is hidden.
   - The chip reads "Viewing: Dashboard".
2. **Overdue invoices**: choose "Overdue invoices".
   - Three typing dots show, then the reply lists the overdue invoices (largest first) and the total
     owed.
   - "Open Receivables" opens Receivables › Receivables.
3. **Live figures**: record a payment against an overdue invoice in Receivables, then ask "who owes
   me money" again. The overdue total has gone down.
4. **Other answers**: ask "low stock", "how much did I spend", "refund", "invoice", "sales today",
   "supplier order", "hello" and "what's the weather".
   - Each gets the design's wording and the right action. "Low stock" lists Skateboard, Knee pads
     and Laser Printer.
   - The fallback suggests the two example questions.
5. **Role gate**: switch to the Cashier and ask "who owes me money". The reply is "You don't have
   access to Receivables. Ask the business owner." with no action. "Low stock" is also refused, because the
   Cashier only sees Stock › Stock management, not Stock › Overview. "How do I give a refund?"
   answers, with "Open Refunds", because the Cashier can see Refunds (credit notes).
6. **Chat list**: choose "All chats".
   - "Which customers owe me money?" (3d) is under "Last 7 days". The two older chats (2w and 4w)
     are under "Older".
   - "Last 7 days" filters the list.
   - Opening "How do I give a refund?" shows its answer and "Open Refunds".
7. **Report a problem**: start a new chat and choose "Report a problem". Uza AI asks for details.
   Type "The till won't print receipts".
   - The reply says TKT-1043 was logged.
   - "Open TKT-1043" opens Support on that ticket. It shows the message with "(Reported from …)"
     and the automatic 4-hour reply.
8. **Support**:
   - The list shows TKT-1043, TKT-1042, TKT-1041 and TKT-1038.
   - TKT-1038 (Resolved) has no reply box. In TKT-1041, send "Any update?": it appears as "You".
   - "New request" with an empty subject shows "Add a subject so we know what this is about.".
   - Fill in "Barcode scanner", High, and a description, then send. The toast reads "TKT-1044 sent
     to support.", and the ticket opens with the 1-hour automatic reply.
9. **Features**:
   - The Roadmap shows Planned (3), In progress (1) and Done (1).
   - In Browse, ideas are sorted by votes (M-Pesa 214 first). Vote for "Print barcode labels": the
     count goes from 64 to 65 and the button turns green.
   - My ideas lists WhatsApp and barcode labels.
   - In New, "Check for similar ideas" with an empty title shows "Give your idea a title.".
   - Enter the title "WhatsApp receipts" and an outcome, then check. "Send receipts on WhatsApp" is
     listed.
   - Submit. The toast reads "Thanks. Your idea was shared.", and My ideas shows it with 1 vote and
     "Your idea".
10. **Keyboard**: open with Enter on the launcher.
    - Tab cycles inside the panel.
    - Escape closes it and focus returns to the launcher.
    - In the composer, Shift+Enter adds a new line and Enter sends.
11. **Phones**:
    - At 320–430px the panel is full width, and the Features switch and ticket cards fit.
    - With the panel closed, scrolling any page to the bottom shows its last controls above the
      launcher.
    - On a phone, a chat action closes the panel.
12. **Sign out**: with the panel open, sign out. The login page has no launcher. Signing back in
    shows the launcher with the panel closed.

## Gates

```bash
npm run typecheck && npm run lint && npm run test:unit && npm run build && npm run test:smoke
node "$SCRATCH/mobile/audit.mjs"   # 0 issues, including the launcher-overlap check
```
