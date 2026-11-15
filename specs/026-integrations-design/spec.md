# Feature 026: Integrations as in the design

**Date**: 2026-11-15 · **Status**: Implemented

## Summary
The design (canvas version `1794714709-05c0`) redesigns **Integrations**: M-Pesa (Daraja), M-Pesa bank integrations and QuickBooks. Feature 015 already had these tabs; this brings them in line with the design.

## Requirements
- **FR-001 M-Pesa (Daraja).**
  - The tab opens on the whole business with its saved set-up. The seed is the design's: a live Till 524118, tested, with payment URLs registered.
  - Status chips show Configured, Connection tested and Payment URLs registered.
  - **Payments received** lists the payments on the business-wide account, newest first, with All / Not matched / Matched filters.
  - **Match** opens "Match payment". It lists open invoices, closest balance first, and **Record payment** records the customer payment against the one picked (Receivables, M-Pesa Till, the M-Pesa code).
  - Matching needs Write on Integrations and on Receivables.
- **FR-002 M-Pesa bank integrations.**
  - The tab lists linked bank Paybills: bank, Paybill, account, what customers pay (account#SALE NO.), the account payments are recorded in, the status and a remove button.
  - **Add a bank integration** asks for the bank (Paybill filled in), account number, account name, where payments are recorded, and how they reach UzaPro (Bank API (instant) or Daily statement upload). A preview line explains the result.
  - Bank API links start as **Waiting for bank**; statement links start as **Active**. The design's messages apply.
- **FR-003 QuickBooks.**
  - **Connect QuickBooks** asks you to **Choose your company** (a simulated Intuit sign-in), then connects to it.
  - Once connected, the tab shows the connection, what to send, the accounts, when to send, **Sync now**, **Save settings** and **Disconnect**.
  - **Sync history** lists each sync. As in the design, the first sync with customers can't send the walk-in customer; **Retry** sends it as "Walk-in Customer (UzaPro)".

## Design deviations
- **Only NCBA can be added** (user decision). The design lists six banks and seeds an Equity Bank link; the bank list is NCBA only and nothing is linked at the start. The NCBA till and QR-code set-up of feature 015 is replaced by the design's Paybill links.
- **Bank links send no M-Pesa requests.** The till's requests use Daraja only, as bank Paybills take payments customers make themselves.
- **Till store number.** The seeded Till also fills the head-office store number (524118), which UzaPro needs for STK requests on a Till.
- **QuickBooks accounts follow what is sent.** The expense account appears when expenses are sent, as in feature 015.
- **Applies to.** The form keeps feature 015's choices ("All terminals (business-wide)" and each terminal) and its field-level messages.
