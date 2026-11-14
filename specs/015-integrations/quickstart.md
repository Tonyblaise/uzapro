# Quickstart: Integrations

Run `npm run dev`, log in as the Owner (demo@uzapro.com / demo@123).

1. Sidebar › Integrations opens M-Pesa (Daraja). Test connection and Register payment URLs are disabled.
2. Switch Account type to Till: Store number and Till number replace Paybill number, and Account numbers disappears. Choose Save: each missing field has its own message.
3. Switch back to Paybill. Applies to: All terminals. Paybill 522522, Add terminal › Terminal 1 › FRONT, fill the three keys, Save. "Configured" is done and the key fields are empty.
4. Test connection, then Register payment URLs. All three pills are done. Change the Paybill number: Test is disabled until you save, and saving resets the last two pills.
5. Applies to › "Terminal 1 · no credentials yet": the form is empty. Back to All terminals: the saved values return.
6. M-Pesa bank integrations: Applies to All terminals, NCBA till number 000001, Save. The six created fields fill in; copy the API secret key and paste it somewhere to see the value. Test connection.
7. QuickBooks: Connect QuickBooks, tick Expenses and Save (it asks for the expenses account), choose one, Save, Sync now. Last sync lists what was sent. Disconnect returns the Connect card.
8. Settings no longer has Connected apps or Import and export, and Integrations has three tabs.
9. Permissions › Edit role › Store keeper › Integrations: Read. View as Store keeper: the fields are disabled and there are no action buttons.

## Automated checks

```
npm run typecheck
npm run lint
npm run test:unit
npm run test:smoke
```
