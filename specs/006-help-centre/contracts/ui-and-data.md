# Contract: Help Centre routes and data access

## Routes

| Path | Tabs |
|---|---|
| `/help` → `/help/ask-uzapro` | `ask-uzapro`, `how-to-guides`, `help-requests`, `response-times` |

- Overlays follow the generic conventions: `?action=new` opens "New record" on every tab, and
  `?view=<first cell>` opens the record drawer on the list tabs.
- Header action: "New" on every Help tab.

| Role | Tabs |
|---|---|
| Owner, Accountant | all four |
| Cashier, Store keeper | Ask UzaPro and How-to guides |

## Data (`@/data`)

```ts
useChatMessages(): ChatMessage[]
sendChatMessage(text: string): Promise<Result<void>>   // no toast; fail on blank text
CHAT_REPLY: string                                      // the design's fixed reply
// The lists use the existing useGenericRows("sup", tab) and deleteGenericRow.
```
