"use client";

import Link from "next/link";
import { Fragment, useEffect, type ReactNode } from "react";
import {
  articlePath,
  boldParts,
  getArticle,
  resolveScreenLink,
  updatedAgo,
  useVisibleTabs,
  type HelpArticle,
  type HelpBlock,
  type HelpOutlineEntry,
  type HelpScreenLink,
} from "@/data";
import { Icon } from "@/components/ui/Icon";
import { useHelpRoute } from "./shared";

/** Paragraph text with `**bold**` segments (odd parts are bold). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {boldParts(text).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-text">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** A screen link (T016): a real link only when the role can see that module tab; else plain text. */
function ScreenLink({ link }: { link: HelpScreenLink }) {
  const target = resolveScreenLink(link);
  const tabs = useVisibleTabs(target?.moduleId ?? link.module);
  const allowed = !!target && tabs.some((t) => t.title === target.tabTitle);
  if (!target || !allowed) return <span className="text-text-secondary">{link.label}</span>;
  return (
    <Link href={target.href} className="inline-flex items-center gap-1.5 font-medium text-link">
      {link.label}
      <Icon name="arrow-right" size={14} />
    </Link>
  );
}

function ArticleLink({ id }: { id: string }) {
  const { articleHref } = useHelpRoute();
  const a = getArticle(id);
  if (!a) return null;
  return (
    <Link href={articleHref(a.id)} className="inline-flex items-center gap-1.5 font-medium text-link">
      <Icon name="file-text" size={14} />
      {a.title}
    </Link>
  );
}

const TEXT = "type-body m-0 text-text-secondary";

function Block({ block, faqId }: { block: HelpBlock; faqId?: string }) {
  switch (block.kind) {
    case "p":
      return (
        <p className={TEXT}>
          <Rich text={block.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const List = block.kind;
      return (
        <List className={`${TEXT} flex flex-col gap-1.5 pl-6 ${block.kind === "ul" ? "list-disc" : "list-decimal"}`}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Rich text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="type-small w-full border-collapse text-left">
            <thead className="bg-grey-50">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="type-label border-b border-border px-4 py-2.5 font-semibold text-text">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  {r.map((c, j) => (
                    <td key={j} className="px-4 py-2.5 align-top text-text-secondary">
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note": {
      const warn = block.tone === "warning";
      return (
        <div className={`flex gap-3 rounded-md px-4 py-3 ${warn ? "bg-warning-soft text-warning-text" : "bg-info-soft text-info-text"}`}>
          <span className="mt-0.5 shrink-0">
            <Icon name={warn ? "circle-alert" : "info"} size={18} />
          </span>
          <p className="type-body m-0">
            <span className="sr-only">{warn ? "Warning: " : "Note: "}</span>
            <Rich text={block.text} />
          </p>
        </div>
      );
    }
    case "faq":
      return (
        <div className="flex flex-col gap-2">
          <h4 id={faqId} className="type-title m-0 scroll-mt-24 text-text">
            {block.q}
          </h4>
          {block.a.map((t, i) => (
            <p key={i} className={TEXT}>
              <Rich text={t} />
            </p>
          ))}
        </div>
      );
    case "links":
      return (
        <ul className="type-body m-0 flex list-none flex-col gap-2 p-0">
          {(block.screens ?? []).map((l) => (
            <li key={`${l.module}/${l.tab}`}>
              <ScreenLink link={l} />
            </li>
          ))}
          {(block.articles ?? []).map((id) => (
            <li key={id}>
              <ArticleLink id={id} />
            </li>
          ))}
        </ul>
      );
  }
}

/**
 * An article (T010, T016): breadcrumbs, title, updated line, intro, then the sections divided by
 * rules. Heading ids come from `outline()` (passed in as `entries`) in the same order, so the
 * "On this page" links and `#hash` addresses land on them.
 */
export function ArticleView({ article, entries }: { article: HelpArticle; entries: HelpOutlineEntry[] }) {
  const { landingHref, categoryHref } = useHelpRoute();
  const path = articlePath(article.id);

  // Ids in outline order: each section's heading, then its FAQ questions.
  let n = 0;
  const sections = article.sections.map((s) => ({
    section: s,
    id: entries[n++]?.id,
    faqIds: s.blocks.map((b) => (b.kind === "faq" ? entries[n++]?.id : undefined)),
  }));

  // A deep link with `#heading` scrolls there once the article has rendered.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [article.id]);

  const crumbs: { label: string; href: string }[] = [{ label: "Help Center", href: landingHref }, ...path.map((c) => ({ label: c.name, href: categoryHref(c.id) }))];

  const body: ReactNode[] = sections.map(({ section, id, faqIds }, i) => {
    const top = section.level === 2;
    return (
      <section key={i} aria-labelledby={id} className={top ? "flex flex-col gap-4 border-t border-border pt-8" : "flex flex-col gap-3 pt-2"}>
        {top ? (
          <h3 id={id} className="type-h2 m-0 scroll-mt-24 border-b border-border pb-3 text-text">
            {section.heading}
          </h3>
        ) : (
          <h4 id={id} className="type-title m-0 scroll-mt-24 text-text">
            {section.heading}
          </h4>
        )}
        {section.blocks.map((b, j) => (
          <Block key={j} block={b} faqId={faqIds[j]} />
        ))}
      </section>
    );
  });

  const related = (article.related ?? []).filter((id) => getArticle(id));

  return (
    <article className="flex min-w-0 flex-col gap-8">
      <header className="flex flex-col gap-3">
        <nav aria-label="Breadcrumb">
          <ol className="type-small m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 text-text-muted">
            {crumbs.map((c) => (
              <li key={c.href} className="flex min-w-0 items-center gap-1.5">
                <Link href={c.href} className="break-words text-text-muted no-underline hover:text-text hover:underline">
                  {c.label}
                </Link>
                <span aria-hidden="true" className="shrink-0">
                  <Icon name="chevron-right" size={14} />
                </span>
              </li>
            ))}
            <li className="min-w-0">
              <span aria-current="page" className="break-words font-semibold text-text">
                {article.title}
              </span>
            </li>
          </ol>
        </nav>
        <h2 className="type-display m-0 break-words text-text">{article.title}</h2>
        <p className="type-small m-0 flex items-center gap-1.5 text-text-muted">
          <Icon name="clock" size={14} />
          Updated {updatedAgo(article.updated)}
        </p>
      </header>
      {article.intro.length > 0 && (
        <div className="flex flex-col gap-4">
          {article.intro.map((t, i) => (
            <p key={i} className="type-body m-0 text-text">
              <Rich text={t} />
            </p>
          ))}
        </div>
      )}
      {body}
      {related.length > 0 && (
        <aside aria-label="Related articles" className="flex flex-col gap-3 border-t border-border pt-6">
          <p className="type-eyebrow m-0 text-text-secondary">Related articles</p>
          <ul className="type-body m-0 flex list-none flex-col gap-2 p-0">
            {related.map((id) => (
              <li key={id}>
                <ArticleLink id={id} />
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
