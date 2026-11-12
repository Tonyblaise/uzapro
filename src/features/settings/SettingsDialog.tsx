"use client";
/**
 * The shared add / edit dialog for branches, location groups and storage locations (design
 * `setOpen` and the `setModal` kinds 'branch', 'group' and 'store'). New branches and groups can
 * also create their store and terminal in turn. Opens with `?action=new` or `?view=<name>`.
 */
import { useState } from "react";
import {
  addLocationType,
  groupParentOptions,
  saveBranch,
  saveGroup,
  saveStorageLocation,
  toast,
  useBranches,
  useGroups,
  useLocationTypes,
  useStorageLocations,
  type Result,
} from "@/data";
import { Input } from "@/components/ui/Field";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Cell, Check, DupeNote, Head, SetModal, addCity, cityOptions } from "./shared";

export type SetKind = "branch" | "group" | "store";

const TOP = "None (top level)";

const dupe = (name: string, edit: string | undefined, list: string[]) => !!name && name !== edit && list.some((x) => x.toLowerCase() === name.toLowerCase());

/** Runs a save and closes on success (the design closes the dialog; the command shows the toast). */
async function run<T>(p: Promise<Result<T>>, onClose: () => void) {
  const res = await p;
  if (res.ok) onClose();
  else toast(res.message);
}

export function SettingsDialog({ kind, edit, onClose }: { kind: SetKind; edit?: string; onClose: () => void }) {
  if (kind === "branch") return <BranchDialog key={edit ?? "new"} edit={edit} onClose={onClose} />;
  if (kind === "group") return <GroupDialog key={edit ?? "new"} edit={edit} onClose={onClose} />;
  return <StoreDialog key={edit ?? "new"} edit={edit} onClose={onClose} />;
}

// ---- Branch -----------------------------------------------------------------------------------

function BranchDialog({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const branches = useBranches();
  const groups = useGroups();
  const b = edit ? branches.find((x) => x.name === edit) : undefined;
  const [f, setF] = useState(() =>
    b
      ? { name: b.name, phone: b.phone, email: b.email, group: b.group, city: b.city, address: b.address, hq: b.hq, mkStore: false, mkTerm: false }
      : { name: "", phone: "", email: "", group: groups[0]?.name ?? "", city: "", address: "", hq: false, mkStore: false, mkTerm: false },
  );
  if (edit && !b) return null;
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));
  const name = f.name.trim();
  const taken = dupe(
    name,
    edit,
    branches.map((x) => x.name),
  );
  const blocked = !name || taken || !f.group;
  const termSub = !f.mkStore ? "Needs a storage location to sell from." : `Named "${name || "…"} Terminal".`;

  return (
    <SetModal
      title={edit ? "Edit branch" : "Add branch"}
      sub="A shop, office or warehouse site."
      width={640}
      btn={edit ? "Save changes" : "Create branch"}
      blocked={blocked}
      onClose={onClose}
      onSave={() => !blocked && void run(saveBranch({ ...f }, edit), onClose)}
    >
      <Cell>
        <Input label="Name" placeholder="For example, Westlands Branch" value={f.name} onChange={(e) => set({ name: e.target.value })} />
      </Cell>
      {taken && <DupeNote sub="Pick a different branch name." />}
      <Cell half>
        <Input label="Phone" type="tel" placeholder="Contact number" value={f.phone} onChange={(e) => set({ phone: e.target.value })} />
      </Cell>
      <Cell half>
        <Input label="Email" type="email" placeholder="Branch email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
      </Cell>
      <Cell>
        <SearchSelect
          label="Location group or region"
          noun="option"
          options={groups.map((g) => g.name)}
          value={f.group}
          onChange={(group) => set({ group })}
        />
      </Cell>
      <Head>Address</Head>
      <Cell half>
        <SearchSelect label="City or town" noun="town" options={cityOptions()} value={f.city} onChange={(city) => set({ city })} onCreate={addCity} />
      </Cell>
      <Cell half>
        <Input label="Street or building" placeholder="Address line" value={f.address} onChange={(e) => set({ address: e.target.value })} />
      </Cell>
      <Check label="Set as main headquarters" sub="Used on receipts and as the default branch." checked={f.hq} onChange={(hq) => set({ hq })} />
      {!edit && (
        <>
          <Head>Also create under this branch</Head>
          <Check
            label="Create storage location"
            sub={name ? `Named "${name} Store", with sales (POS) turned on.` : 'Named "… Store".'}
            checked={f.mkStore}
            onChange={(mkStore) => set({ mkStore })}
          />
          <Check label="Create terminal" sub={termSub} checked={f.mkTerm} disabled={!f.mkStore} onChange={(mkTerm) => set({ mkTerm })} />
        </>
      )}
    </SetModal>
  );
}

// ---- Location group ---------------------------------------------------------------------------

function GroupDialog({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const groups = useGroups();
  const g = edit ? groups.find((x) => x.name === edit) : undefined;
  const [f, setF] = useState(() => (g ? { name: g.name, parent: g.parent || TOP, mkBranch: false, mkStore: false, mkTerm: false } : { name: "", parent: TOP, mkBranch: false, mkStore: false, mkTerm: false }));
  if (edit && !g) return null;
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));
  const name = f.name.trim();
  const taken = dupe(
    name,
    edit,
    groups.map((x) => x.name),
  );
  const blocked = !name || taken;
  const n = name || "…";

  return (
    <SetModal
      title={edit ? "Edit location group" : "Add location group"}
      sub="A region or part of the business that branches belong to."
      width={600}
      btn={edit ? "Save changes" : "Create group"}
      blocked={blocked}
      onClose={onClose}
      onSave={() => !blocked && void run(saveGroup({ ...f }, edit), onClose)}
    >
      <Cell>
        <Input label="Name" placeholder="For example, Nairobi Region" value={f.name} onChange={(e) => set({ name: e.target.value })} />
      </Cell>
      {taken && <DupeNote sub="Pick a different group name." />}
      <Cell>
        <SearchSelect label="Parent group (optional)" noun="option" options={groupParentOptions(groups, edit)} value={f.parent} onChange={(parent) => set({ parent })} />
      </Cell>
      {!edit && (
        <>
          <Head>Also create under this group</Head>
          <Check label="Create branch" sub={`Named "${n} Branch".`} checked={f.mkBranch} onChange={(mkBranch) => set({ mkBranch })} />
          <Check label="Create storage location" sub={`Named "${n} Store".`} checked={f.mkStore} disabled={!f.mkBranch} onChange={(mkStore) => set({ mkStore })} />
          <Check
            label="Create terminal"
            sub={`Named "${n} Terminal".`}
            checked={f.mkTerm}
            disabled={!f.mkStore || !f.mkBranch}
            onChange={(mkTerm) => set({ mkTerm })}
          />
        </>
      )}
    </SetModal>
  );
}

// ---- Storage location -------------------------------------------------------------------------

function StoreDialog({ edit, onClose }: { edit?: string; onClose: () => void }) {
  const stores = useStorageLocations();
  const branches = useBranches();
  const types = useLocationTypes();
  const r = edit ? stores.find((x) => x.name === edit) : undefined;
  const [f, setF] = useState(() =>
    r ? { name: r.name, branch: r.branch, type: r.type, pos: r.pos } : { name: "", branch: (branches.find((x) => x.hq) ?? branches[0])?.name ?? "", type: "Store", pos: true },
  );
  if (edit && !r) return null;
  const set = (patch: Partial<typeof f>) => setF((s) => ({ ...s, ...patch }));
  const name = f.name.trim();
  const taken = dupe(
    name,
    edit,
    stores.map((x) => x.name),
  );
  const blocked = !name || taken || !f.branch;

  return (
    <SetModal
      title={edit ? "Edit storage location" : "Add storage location"}
      sub="A store, warehouse or shelf inside a branch where stock is kept."
      width={560}
      btn={edit ? "Save changes" : "Create"}
      blocked={blocked}
      onClose={onClose}
      onSave={() => !blocked && void run(saveStorageLocation({ ...f }, edit), onClose)}
    >
      <Cell>
        <Input label="Name" placeholder="For example, Main Store" value={f.name} onChange={(e) => set({ name: e.target.value })} />
      </Cell>
      {taken && <DupeNote sub="Pick a different name." />}
      <Cell half>
        <SearchSelect label="Parent branch" noun="option" options={branches.map((x) => x.name)} value={f.branch} onChange={(branch) => set({ branch })} />
      </Cell>
      <Cell half>
        <SearchSelect label="Type" noun="type" options={types} value={f.type} onChange={(type) => set({ type })} onCreate={addLocationType} />
      </Cell>
      <Check label="Allow direct sales (POS)" sub="If unticked, this location is for storage only." checked={f.pos} onChange={(pos) => set({ pos })} />
    </SetModal>
  );
}
