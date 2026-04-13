# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Design Knowledge Assistant** — a single-file demo app built for a Dialpad Senior Product Designer interview. No build step, no framework, no backend. Open `index.html` directly in a browser.

## Running the app

```bash
open index.html          # macOS
# or just drag index.html into any browser
```

To verify the Claude API key works, open the browser console and run:
```js
localStorage.setItem('dka_test', '1')
// reload the page — check console for "[DKA] Smoke-test: API OK"
localStorage.removeItem('dka_test')
```

To reset seed data during a demo:
```js
localStorage.clear()
// reload
```

## Architecture

Everything lives in one file: `index.html`. It has three sections in order:

1. **`<style>`** — All CSS. Dialtone design tokens are defined as CSS variables in `:root`. No external stylesheets.
2. **`<body>`** — Static HTML shell. JS injects content into `#add-resource-section`, `#ask-question-section`, and `#item-list` at runtime.
3. **`<script>`** — All JS, structured in labelled blocks:
   - **T2** `getKB / saveKB / addItem / deleteItem` — localStorage CRUD. Storage key: `dka_kb`. Item schema: `{ id, type, title, summary, tags[], url, content, question?, answer?, createdAt }`.
   - **T3** `callClaude / callClaudeStream` — Anthropic API via `fetch()`. Model: `claude-sonnet-4-6`. Requires `anthropic-dangerous-direct-browser-access: true` header for browser CORS.
   - **T4** `handleSaveResource` — Posts to Claude, expects a JSON-only response `{ title, summary, tags }`, saves result to KB.
   - **T5** `renderList / createRow / showDetail` — Renders the item list and positions the hover popover using `getBoundingClientRect()`.
   - **T6** `handleAskQuestion` — Streams a Claude response into `.chat-answer-block`, saves the Q&A pair back to KB on completion.
   - **T8** `SEED_ITEMS` — 4 hardcoded seed items loaded on first run (when localStorage is empty).

## Design system

Dialtone tokens are hand-implemented as CSS variables — no Dialtone package is installed. Primary purple is `#6C4FF6`. When adding UI, reference existing token names in `:root` rather than hardcoding hex values.

## Key constraints

- **Single file** — all HTML, CSS, and JS must stay in `index.html`. No imports, no bundler.
- **API key is hardcoded** — acceptable for single-use demo only. Do not commit to a public repo.
- **No URL scraping** — Claude summarises from whatever text the user pastes. It does not fetch URLs.
- **localStorage only** — no backend. Data does not persist across browsers or devices.
