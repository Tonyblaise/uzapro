# Implementation Plan: WhatsApp receipts, invoices and payment reminders

**Branch**: `020-whatsapp` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

`src/data/whatsapp.ts` (pure) normalises a phone number, builds the click-to-chat link and writes
the three messages. `src/components/ui/WhatsAppDialog.tsx` shows the phone, the message and the
link. It is opened from the sale record, the invoice record, the Receivables row menu and the
till receipt. `money.reminders` logs reminders per customer.

## Technical Context

TypeScript strict, no new dependencies, in memory only, no network calls by the app. Tests: Vitest
`tests/unit/whatsapp.test.ts`; Playwright `tests/smoke/whatsapp.spec.ts` (asserts the link's
`href`; it does not follow it) and a 320px row in `responsive.spec.ts`.

## Constitution Check

| Principle | Status |
|---|---|
| I. Design fidelity | ✅ with recorded deviations (4 rows) |
| II. Data seam | ✅ no new seed; components use `@/data` |
| III. Ephemeral | ✅ the reminder log is in memory |
| IV. Tokens and accessibility | ✅ existing Modal, Input, Textarea; a real `<a href>` |
| V. Config-driven modules | ✅ no new tabs |
| VI. Simplicity and types | ✅ one pure module, one dialog |
| Technology Constraints (no third-party APIs) | ⚠️ a user-opened hyperlink to `wa.me`; the app calls nothing. Recorded in spec › Design deviations. |

## Project Structure

```text
src/data/whatsapp.ts                    # pure: number, link, messages (new)
src/data/commands/whatsapp.ts           # noteWhatsApp (toast + reminder log) (new)
src/data/queries-whatsapp.ts            # useCustomerPhone, useLastReminder, message hooks (new)
src/data/store/{state,seed}.ts          # money.reminders
src/data/permissions.ts                 # "WhatsApp" and "Send reminder" need Read
src/components/ui/WhatsAppDialog.tsx    # (new)
src/features/sales/{SaleView,RecordView,DocumentLists}.tsx
src/features/receivables/ReceivableList.tsx
src/features/pos/Dialogs.tsx
src/data/fixtures/{uzaai,helpcenter}.ts
tests/unit/whatsapp.test.ts, tests/smoke/whatsapp.spec.ts
```

## Complexity Tracking

| Exception | Why needed | Simpler alternative rejected because |
|---|---|---|
| A hyperlink to `wa.me` | It is the feature: the message has to reach WhatsApp | A simulated "sent" toast, like SMS and email today, would deliver nothing |
