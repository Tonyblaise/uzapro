# Contract: UI

**WhatsAppDialog** (Modal): title "Send on WhatsApp", subtitle the recipient. Fields: "Phone
number" (hint "Enter a mobile number, for example 0712 345 678" when not valid) and "Message"
(textarea). Optional line "Last reminded {when}". Footer: "Cancel" and the link "Open WhatsApp"
(a real `<a target="_blank">`; shown as a disabled button until the number is valid).

Entry points: Receivables row "Send reminder"; sale record "WhatsApp"; invoice record "WhatsApp";
till receipt "WhatsApp".
