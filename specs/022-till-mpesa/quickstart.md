# Quickstart: The till uses the saved M-Pesa set-up

Run `npm run dev`, log in as the Owner (demo@uzapro.com / demo@123).

1. Point of sale › Terminal 1 › Launch, PIN 1234. Add Bike Pump, Charge, M-Pesa. The note says requests are not set up; there is no phone field. Type a code and complete the sale.
2. Integrations › M-Pesa (Daraja): All terminals, Paybill 522522, Add terminal › Terminal 1 › FRONT, the three keys, Save. Back at the till, M-Pesa now says the connection has not been tested.
3. Test connection. At the till, M-Pesa shows the phone field and "Payments go to Paybill 522522, account FRONT." Enter 0712 345 678, Send request: a code is filled in.

## Automated checks

```
npm run typecheck
npm run lint
npm run test:unit
npm run test:smoke
```
