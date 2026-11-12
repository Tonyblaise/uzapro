"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  browseIdeas,
  checkIdea,
  ideaTone,
  ideaVotes,
  myIdeas,
  roadmap,
  setFeaturesTab,
  setIdeaForm,
  setIdeaQuery,
  similarIdeas,
  submitIdea,
  toggleIdeaVote,
  useUzaAi,
  type FeatureIdea,
  type FeaturesTabName,
  type Tone,
} from "@/data";
import { IconTile } from "./shared";

const SWITCH: FeaturesTabName[] = ["Roadmap", "My ideas", "Browse", "New"];

/** Soft ground and strong text per roadmap group (Planned info, In progress warning, Done green). */
const GROUP_LOOK: Record<Tone, string> = {
  info: "bg-info-soft text-info-text",
  warning: "bg-warning-soft text-warning-text",
  success: "bg-green-50 text-green-700",
  danger: "bg-danger-soft text-danger-text",
  neutral: "bg-neutral-soft text-neutral-text",
};

/** Canvas `ai.isFeatures`: Roadmap, My ideas, Browse and New (User Story 4). */
export function FeaturesTab() {
  const { features } = useUzaAi();
  return (
    <>
      <div className="flex flex-none flex-col gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <IconTile icon="lightbulb" />
          <div>
            <div className="type-title text-text">Features</div>
            <div className="type-small text-text-secondary">Ideas you shared, voted on, or want to browse.</div>
          </div>
        </div>
        <div role="tablist" aria-label="Features" className="grid grid-cols-4 gap-1 rounded-lg bg-canvas p-1">
          {SWITCH.map((t) => {
            const on = features.tab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setFeaturesTab(t)}
                className={`type-label min-w-0 whitespace-nowrap rounded-md px-1 py-2 ${on ? "bg-surface text-text shadow-sm" : "text-text-secondary hover:text-text"}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-5 py-4">
        {features.tab === "Roadmap" && <Roadmap />}
        {(features.tab === "Browse" || features.tab === "My ideas") && <IdeaList />}
        {features.tab === "New" && <NewIdea />}
      </div>
    </>
  );
}

function Roadmap() {
  const { ideas, votes } = useUzaAi();
  return (
    <>
      {roadmap(ideas).map((g) => (
        <section key={g.status} aria-label={g.status} className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3">
          <div className="flex justify-center">
            <span aria-hidden="true" className={`grid size-9 place-items-center rounded-md ${GROUP_LOOK[g.tone]}`}>
              <Icon name={g.icon} size={17} />
            </span>
          </div>
          <h3 className="type-label self-center text-text">
            {g.status} <span className="font-normal text-text-muted">({g.ideas.length})</span>
          </h3>
          {g.ideas.map((i) => (
            <div key={i.id} className="contents">
              <div className="flex justify-center">
                <span aria-hidden="true" className="h-full w-0.5 bg-border" />
              </div>
              <div className="my-1 flex flex-col gap-2 rounded-lg border border-border p-4">
                <div className="type-title text-text">{i.title}</div>
                <div className="type-body leading-[1.55] text-text-secondary">{i.desc}</div>
                <div className="type-small flex items-center gap-3 text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="calendar" size={14} />
                    {i.eta}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="thumbs-up" size={14} />
                    {ideaVotes(i, votes)} votes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

function VoteButton({ idea, compact }: { idea: FeatureIdea; compact?: boolean }) {
  const { votes } = useUzaAi();
  const on = !!votes[idea.id];
  const look = on ? "border-green-600 bg-green-50 text-green-700" : "border-border bg-surface text-text-secondary hover:text-text";
  return (
    <button
      type="button"
      onClick={() => toggleIdeaVote(idea.id)}
      aria-label={`${on ? "Remove vote for" : "Vote for"} ${idea.title}`}
      aria-pressed={on}
      className={
        compact
          ? `type-small inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 font-semibold ${look}`
          : `flex w-12 flex-none flex-col items-center justify-center gap-0.5 self-start rounded-md border py-1.5 ${look}`
      }
    >
      <Icon name="chevron-up" size={compact ? 14 : 16} />
      <span className={compact ? "u-num" : "type-label u-num"}>{ideaVotes(idea, votes)}</span>
    </button>
  );
}

function IdeaList() {
  const { ideas, votes, mine, features } = useUzaAi();
  const browse = features.tab === "Browse";
  const list = browse ? browseIdeas(ideas, votes, features.q) : myIdeas(ideas, votes, mine);
  return (
    <>
      {browse && <Input icon="search" placeholder="Search ideas" aria-label="Search ideas" value={features.q} onChange={(e) => setIdeaQuery(e.target.value)} />}
      {list.map((i) => {
        const meta = (mine[i.id] ? `Your idea${i.tags ? " · " : ""}` : "") + (i.tags ? `Tags: ${i.tags}` : "");
        return (
          <article key={i.id} aria-label={i.title} className="flex gap-3 rounded-lg border border-border px-4 py-3">
            <VoteButton idea={i} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <span className="type-label flex-1 text-text">{i.title}</span>
                <StatusPill tone={ideaTone(i.status)}>{i.status}</StatusPill>
              </div>
              <div className="type-small leading-[1.5] text-text-secondary">{i.desc}</div>
              {meta && <div className="type-small text-text-muted">{meta}</div>}
            </div>
          </article>
        );
      })}
      {list.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border-[1.5px] border-dashed border-border-strong bg-canvas px-5 py-6 text-center">
          <div className="type-body text-text-secondary">{browse ? "No ideas match your search." : "Ideas you share or vote for will show here."}</div>
          {!browse && (
            <Button icon="plus" onClick={() => setFeaturesTab("New")}>
              Share an idea
            </Button>
          )}
        </div>
      )}
    </>
  );
}

function NewIdea() {
  const { ideas, features } = useUzaAi();
  const f = features.form;
  const matches = features.checked ? similarIdeas(ideas, f.title, f.outcome) : [];
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="type-small flex gap-2 rounded-md border border-warning/40 bg-warning-soft px-4 py-3 text-warning-text">
        <span className="mt-px flex-none">
          <Icon name="info" size={16} />
        </span>
        <span>Your idea&apos;s title and outcome may be seen by other UzaPro customers. Comments are seen only by you and the UzaPro team.</span>
      </div>
      <Input label="Idea title" placeholder="For example, Send receipts on WhatsApp" value={f.title} onChange={(e) => setIdeaForm({ title: e.target.value })} />
      <Textarea
        label="What would it help you do?"
        rows={4}
        placeholder="Describe the result you want, not how to build it."
        value={f.outcome}
        onChange={(e) => setIdeaForm({ outcome: e.target.value })}
      />
      <Input label="Tags (optional)" placeholder="For example, sales, receipts" value={f.tags} onChange={(e) => setIdeaForm({ tags: e.target.value })} />
      {features.error && (
        <div role="alert" className="type-small text-danger-text">
          {features.error}
        </div>
      )}
      {!features.checked ? (
        <Button icon="search" fullWidth onClick={() => checkIdea()}>
          Check for similar ideas
        </Button>
      ) : (
        <>
          <h3 className="type-eyebrow text-text-muted">{matches.length ? "Similar ideas. Vote for one if it covers yours" : "No similar ideas found"}</h3>
          {matches.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
              <span className="type-label min-w-0 flex-1 text-text">{m.title}</span>
              <VoteButton idea={m} compact />
            </div>
          ))}
          <Button icon="check" fullWidth onClick={() => submitIdea()}>
            Submit my idea
          </Button>
        </>
      )}
    </div>
  );
}
