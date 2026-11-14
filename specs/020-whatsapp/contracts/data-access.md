# Contract: data access

```ts
// src/data/whatsapp.ts
export function waNumber(phone: string): string | null;                 // "254712340118"
export function waLink(phone: string, text: string): string | null;     // https://wa.me/…?text=…
export function receiptMessage(a: { biz: string; ref: string; date: string; customer: string; lines: { name: string; qty: number; amount: number }[]; total: number; paid: string }): string;
export function invoiceMessage(a: { biz: string; number: string; customer: string; amount: number; balance: number; due: string }): string;
export function reminderMessage(a: { biz: string; customer: string; items: { doc: string; due: string; balance: number; daysLate: number }[] }): string;

// src/data/commands/whatsapp.ts
noteWhatsApp(name: string, reminder?: boolean): void;   // toast "WhatsApp opened for {name}."; logs a reminder
```
