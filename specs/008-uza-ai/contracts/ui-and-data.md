# Contract: Uza AI UI and data access

## UI surface (every signed-in page)

| Element | Accessible name / role | Notes |
|---|---|---|
| Launcher | button "Open Uza AI" | Shown while the panel is closed. Tooltip "Open Uza AI". |
| Panel | dialog "Uza AI and help" | Focus trap. Escape closes it and returns focus to the launcher. |
| Panel tabs | tablist; tabs "Uza AI", "Support", "Features" | Selected by `aria-selected` |
| Close | button "Close" | |
| Chat header | buttons "All chats", "New chat" | Title: the chat's title, or "Uza AI" |
| Suggestions | buttons "Overdue invoices", "Low stock", "Spending this month", "Report a problem" | Only in the empty state |
| Composer | textbox "Message to Uza AI"; buttons "Send", "Remove file"; file input via the "Attach a file" label | Counter "{n} / 4,000" |
| Chat list | button "New"; buttons "All", "Last 7 days"; one button per chat row | Headings "Last 7 days" and "Older" |
| Action | button "{label}", for example "Open Receivables" or "Open TKT-1043" | Disabled with the title "Not available for your role" when the role can't see the target |
| Live region | `aria-live="polite"` | The latest Uza AI reply |
| Support list | button "New request"; one button per ticket card | |
| Support form | textbox "Subject"; select "How urgent is it?"; textbox "What happened?"; button "Send to support"; button "Back" | Errors use `role="alert"` |
| Ticket view | button "Back"; textbox "Reply"; button "Send" | The reply box is hidden when Resolved or Closed |
| Features switch | tablist; tabs "Roadmap", "My ideas", "Browse", "New" | |
| Idea vote | button "Vote for {title}" or "Remove vote for {title}", with `aria-pressed` | |
| Browse search | textbox "Search ideas" | |
| Idea form | textbox "Idea title"; textbox "What would it help you do?"; textbox "Tags (optional)"; button "Check for similar ideas", then "Submit my idea" | |

## Data access (`@/data`)

```ts
// queries (hooks)
useUzaAi(): AiState                     // the whole slice (the panel is one component tree)
useViewingLabel(): string               // derived from the current pathname

// commands
openUzaAi(); closeUzaAi()
setAiTab(tab); newAiChat(); showAiList(); openAiChat(id); setAiFilter(f)
setAiDraft(text); setAiFile(name | null)
askUzaAi(text, file?, where): Promise<void>      // 700ms reply delay (research R3)
runAiAction(act): void                           // a ticket opens Support; a screen action is
                                                 // returned to the caller to navigate
supportNew(); supportBack(); openTicket(ref); setSupportForm(patch); sendSupportRequest(): Result<string>
setTicketReply(text); sendTicketReply()
setFeaturesTab(tab); setIdeaQuery(q); toggleIdeaVote(id)
setIdeaForm(patch); checkIdea(): Result<void>; submitIdea(): Result<string>

// pure helpers (unit tested)
answer, chatAge, chatGroups, ideaVotes, roadmap, browseIdeas, myIdeas,
similarIdeas, nextTicketRef, ticketTone, priorityTone, viewingLabel, clipSubject
```

Components import only from `@/data`, never from the fixtures directly (Principle II).

## Changes to existing code

- `AppShell`: render `<UzaAi />`, and add `pb-[88px]` to `<main>`.
- `signOut`: set `ai.open = false`.
- `Overlay.tsx`: export `useDialog`.
- `Icon.tsx`: add 8 icons (research R11).
- `money.ts`: add `receivableRows()`; `useReceivables` uses it.
