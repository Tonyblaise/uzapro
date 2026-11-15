# Feature 023: Tasks (replaces Messages)

**Date**: 2026-11-15 · **Status**: Implemented

## Summary
Office › Messages (SMS/email/WhatsApp templates, campaigns, scheduled sends) is removed. **Office › Tasks** takes its place. Calendar and File Manager are unchanged.

## Requirements
- **FR-001** A task has a title, an optional due date, an assignee (from Team), a priority (Low / Medium / High), a status (To do / In progress / Done) and notes.
- **FR-002** A task can carry one reminder with a date, an optional time and a repeat (None / Daily / Weekly / Monthly).
- **FR-003** A reminder is *due* once its date and time are at or before the demo clock (10 Nov 2026 plus the real time of day) and its task is not Done.
- **FR-004** Due reminders show at the top of Tasks, on the Dashboard (both layouts) and in the header bell. The bell shows a dot while anything is due.
- **FR-005** A due reminder offers **Mark done** and **Snooze** (1 hour / Tomorrow / Next week). Marking a repeating task done moves its reminder and due date to the next occurrence and sets the task back to To do.
- **FR-006** The Owner sees every task. Other roles see tasks assigned to them or created by them.
- **FR-007** Every role starts with Write on Tasks. Delete stays with the Owner, as for other modules.
- **FR-008** Overlays are URL-driven (`?action=new`, `?view=<id>`, `&step=edit|delete`), following the Calendar.

## Design deviations
- Messages had no working send; its tabs were fixture-only generic screens. They are removed together with their fixtures.
- Tasks has no canvas design. It reuses the Calendar's drawer and modal patterns and the existing filter chips.
