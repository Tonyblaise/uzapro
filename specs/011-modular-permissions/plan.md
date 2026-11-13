# Implementation Plan: Modular role permissions

**Branch**: `011-modular-permissions` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-modular-permissions/spec.md`

## Summary

This replaces the static Permissions table with:
- a **role-card grid** that matches the user's screenshot 1;
- an **Edit Role** dialog that matches screenshot 2, with one row per module (21 rows, grouped by
  sidebar section) and a single access level per row: none, Read, Write or Delete
  (Clarification Q1).

Access becomes real:
- **Read** decides which modules a role can see. It replaces the hard-coded `mods` whitelists in
  `src/config/roles.ts`.
- **Write** gates create and edit controls (Clarification Q2).
- **Delete** gates delete, void, cancel and undo controls.

**Technical approach**:
- **New `permissions` store slice**: role definitions plus an access map per role. It is seeded from
  today's role visibility, so nothing changes until someone edits a role (SC-002).
- **Pure helpers** in `src/data/permissions.ts`. `effectiveRole(state, id)` merges the stored access
  into the config `Role`. The existing `visibleModules`, `visibleTabs` and `canSee` then work
  unchanged.
- **One access context per module screen.** `ModuleScreen` provides `{ module, level }`. Write and
  Delete are then enforced at a few central points, plus a per-file audit of inline buttons:
  - the header **Actions** slot;
  - the `?action=` and `?edit=` overlay params;
  - **`RowActions` / `Menu` items**, by label class;
  - a small `<Can need>` gate for inline buttons in record views.
- **New UI** in `src/features/permissions/`: `RoleCards`, `EditRoleDialog`, `RoleNameDialog` and
  the card "…" menu, built on the existing Card, Button, Modal, ConfirmDialog and Menu primitives.

## Technical Context

**Language/Version**: TypeScript 5.x strict, Node 22 (unchanged)

**Primary Dependencies**: unchanged. There are no new packages. Icons come from lucide-react (add
`FolderLock` or `FolderKey` for the role tile and `UserCog` for "Edit Role" if they aren't
registered yet).

**Storage**: none new. The `permissions` slice is in memory and reloads to the seed
(Principle III).

**Testing**:
- Vitest: `tests/unit/permissions.test.ts` covers the seed parity with today's visibility,
  `levelFor`, `pickLevel`, `effectiveRole`, the row-action label classes and role CRUD validation.
- Playwright:
  - `tests/smoke/permissions.spec.ts`: cards, the dialog, save and cancel, the effect on the role
    switch, Read-only gating, Delete gating, add, rename, duplicate and delete.
  - `responsive.spec.ts`: the page and dialog at 320px with the accessibility scan.
  - `navigation.spec.ts` now works out visibility from the seeded access (`seedRole`), so Profile counts as visible for every role; it stays green, which proves SC-002.

**Target Platform / Project Type**: unchanged (a static-export web app on the Cloudflare Worker)

**Performance Goals**: access changes show instantly after Save. Gating is a constant-time lookup
per control.

**Constraints**:
- Tokens only: role tile colours become named tokens `--role-1` … `--role-6` (research R7).
- Accessible toggle buttons (`aria-pressed`, names like "Sales: Write").
- No sideways scrolling from 320px up.
- Modules must not import each other (Principle V). The new access hooks come from `@/data`, and
  `<Can>` comes from `src/components/`.

**Scale/Scope**:
- 4 built-in roles plus custom roles, 21 modules and 4 levels;
- about 25 feature files to audit for inline Write and Delete controls (research R5).

## Constitution Check

*GATE: must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Design fidelity | The canvas has a static Permissions table. The user explicitly asked for the screenshot view; this is recorded in spec › Design deviations (4 rows). There are no other new screens. | ✅ with recorded deviations |
| II. Data seam | Role definitions, user counts and avatars come from fixtures: the canvas's Permissions table (1/2/4/3), `ppl/team` and `ROLES`. Components read through `@/data` hooks (`useRoleCards`, `useRoleAccess`, `useCan`) and write through commands (`saveRoleAccess`, `addRole` and others). | ✅ |
| III. Ephemeral | The `permissions` slice is in memory. No storage keys; a reload restores the seed. | ✅ |
| IV. Tokens and accessibility | Role colours become named tokens. Buttons use the existing Button and outline styles with a primary border when selected. There's a dialog focus trap, `aria-pressed` and an accessibility scan at 320 and 1440px. | ✅ |
| V. Config-driven modules | Visibility is still the registry filtered by the role. The whitelist now comes from the store's Read access, seeded from `UZ_ROLES`. The constitution text "role's whitelist from `UZ_ROLES`" still holds for the seed; edits narrow or widen it during the session. `src/features/permissions/` depends only on components, data and lib. | ✅ (noted in research R1) |
| VI. Simplicity and types | One `AccessLevel` union, pure helpers and no new dependencies. Central gates instead of per-module logic where possible. | ✅ |

There are no violations, so Complexity Tracking is empty.

**Post-design re-check**: still ✅. The data model adds one slice and one helper module. The
contracts keep components on `@/data`.

## Project Structure

### Documentation (this feature)

```text
specs/011-modular-permissions/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── data-access.md   # hooks, commands, pure helpers
│   └── ui.md            # page, dialog, gating rules, copy
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/
├── config/
│   ├── roles.ts                 # unchanged API; ROLES stay the seed; + ROLE_SEED_ACCESS export
│   └── modules.ts               # perm module: tab screen kind "table" → "roles"
├── data/
│   ├── types/permissions.ts     # AccessLevel, RoleDef, RoleAccess, PermissionsState (new)
│   ├── fixtures/permissions.ts  # built-in role defs (colour, users, people), seed levels (new)
│   ├── permissions.ts           # pure: levelFor, pickLevel, effectiveRole, rowActionNeed, summaries (new)
│   ├── commands/permissions.ts  # saveRoleAccess, addRole, renameRole, duplicateRole, deleteRole (new)
│   ├── queries.ts               # useRole/useSession → effective role; + useCan, useRoleCards, useRoleAccess
│   ├── commands/uzaai.ts        # ROLES[...] → effectiveRole(s, …)
│   ├── commands/generic.ts      # ROLES[...] → effectiveRole(s, …)
│   ├── calendar.ts              # takes Role, not RoleId (callers pass the effective role)
│   └── store/{state,seed}.ts    # + permissions slice
├── components/
│   ├── shell/ModuleScreen.tsx   # AccessProvider; Actions gated at write; ?action/?edit gate
│   ├── shell/RouteGuard.tsx     # uses effective role (via useSession)
│   ├── ui/Menu.tsx              # MenuItem.need?; RowActions filters by access context
│   └── ui/Can.tsx               # <Can need="write|delete"> (new)
├── features/
│   ├── permissions/             # RoleCards, RoleCard, EditRoleDialog, RoleNameDialog, screens (new)
│   ├── generic/screens.tsx      # perm no longer generic
│   ├── screens.ts               # perm → permissionsScreens from features/permissions
│   ├── dashboard/QuickTasks.tsx # hide action tasks without write on the target
│   └── <audited files>          # inline Write/Delete buttons wrapped in <Can> (research R5)
├── styles/tokens.css            # --role-1..6
tests/
├── unit/permissions.test.ts     # new
└── smoke/permissions.spec.ts    # new (+ responsive.spec.ts rows)
```

**Structure Decision**: keep the existing single Next.js app layout. Add a `permissions` feature
folder and one store slice. Gating goes in shared shell and UI components so module folders change
as little as possible.

## Complexity Tracking

No constitution violations to justify.
