# Contract: Help Center routes and data access

## Routes

| Path | Shows |
|---|---|
| `/help` → `/help/help-center` | Landing page |
| `/help/help-center?article=<id>` | Article |
| `/help/help-center?article=<id>#<heading-id>` | Article, scrolled to the heading |

- An unknown `article` value shows the landing page with "That article was not found.".
- The page header has no action. There is no tab strip, because the module has a single tab.
- All four roles see Help › Help Center.
- The shared search value (top bar and landing box) shows search results in the main area while it
  has text.

## Data (`@/data`)

```ts
HELP_CATEGORIES, HELP_ARTICLES                 // read-only fixtures
helpTree(); articlePath(id); outline(article)
searchArticles(q); filterTree(q); updatedAgo(iso)
getArticle(id): HelpArticle | undefined
// existing: useSearch(), setSearch(), canSee() for screen links
```

## Removed (feature 006)

- `sendChatMessage`, `CHAT_REPLY`, `useChatMessages`, `ChatMessage`
- the `sup/*` generic rows
