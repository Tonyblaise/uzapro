# Contract: UI (till M-Pesa)

Checkout dialog, method M-Pesa:

| Route | Phone field and "Send request" | Note |
|---|---|---|
| ready | shown | "Send a payment request to the customer's phone, or type the M-Pesa code yourself. Payments go to {to}." |
| not ready, untested | hidden | "M-Pesa is saved under Integrations, but its connection has not been tested, so requests can't be sent yet. Type the M-Pesa code from the customer's message." |
| not ready, none | hidden | "M-Pesa requests are not set up for this terminal. Type the M-Pesa code from the customer's message. An owner can set requests up under Integrations." |

"M-Pesa code" is always shown. No new routes.
