"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * Help Center addresses (contracts/ui-and-data.md): `?article=<id>` opens an article, `?cat=<id>`
 * shows the landing page with that category expanded, and no parameters shows the landing page.
 */
export function useHelpRoute() {
  const pathname = usePathname();
  const params = useSearchParams();
  return {
    articleId: params.get("article"),
    catId: params.get("cat"),
    landingHref: pathname,
    articleHref: (id: string) => `${pathname}?article=${encodeURIComponent(id)}`,
    categoryHref: (id: string) => `${pathname}?cat=${encodeURIComponent(id)}`,
  };
}
