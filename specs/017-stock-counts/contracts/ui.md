# Contract: UI (counts)

- **Stock › Stock counts**: table Count, Store, Date, Type, Lines counted ("3 of 3"), Variance
  (units, signed), Variance value (KES, signed), Status. Header action "New count".
- **New count** (drawer): Store; a tick list of the products in stock there (all ticked), with
  "Tick all" and "Untick all"; "Start count".
- **Count view** (`?view=CNT-…`): status, facts (Store, Date, Type, Started by, Approved by); lines
  table Product, System, Counted (a number field while in progress), Variance, Value (KES);
  totals Over, Short, Net value. Buttons by status: Save, Submit for approval (in progress);
  Approve, Send back (waiting); Cancel count (in progress or waiting).
