# Tailwind CSS Lookup — Browser Extension

## What This Is
A browser extension that lets developers inspect Tailwind CSS classes on any element. Search any class to see the CSS it generates. The missing browser companion for Tailwind developers.

Built with [WXT](https://wxt.dev/) — builds for Chrome (MV3) and Firefox (MV2) from one codebase.

## Architecture
- **entrypoints/content.ts** — Content script. Handles inspect mode (hover overlay), click-to-copy, page scanning, message handling.
- **assets/inspect-overlay.css** — Styles for inspect overlay, highlight, tooltip, and badge. Imported by content script.
- **entrypoints/background.ts** — Service worker. Forwards messages between popup and content scripts.
- **entrypoints/popup/** — Browser action popup with class search, page summary, and inspect mode toggle.
- **entrypoints/options/** — Options page for enable/disable.
- **utils/tailwind.ts** — Shared Tailwind class detection, lookup, and search logic. Exported for testing.
- **public/data/tailwind-classes.json** — Complete Tailwind CSS v3 class database.
- **public/icon-{16,48,128}.png** — Extension icons.

## Key Implementation Details
- Inspect mode: activates via popup button, injects hover overlay on active tab
- Class database loaded on demand as web-accessible resource
- Page summary scans all elements' classList for known Tailwind classes
- Escape key exits inspect mode, click copies classes to clipboard
- Uses `browser.*` API (WXT polyfill) for cross-browser compatibility
- Tailwind detection uses prefix matching — heuristic, not exact

## Commands
```bash
npm run dev          # Dev mode with HMR (Chrome)
npm run dev:firefox  # Dev mode (Firefox)
npm run build        # Production build (Chrome)
npm run build:firefox # Production build (Firefox)
npm run zip          # Build + zip for store submission
npm run test         # Run Vitest tests
npm run test:watch   # Watch mode
```

## Testing
```bash
npm test
```
- 69 unit tests via Vitest + WXT testing plugin
- Tests cover: Tailwind class detection (50+ classes), prefix stripping, search logic
- Shared logic in `utils/tailwind.ts` is fully testable

## Conventions
- WXT framework with vanilla TypeScript (no UI framework)
- Version: semver, 0.2.x (WXT rewrite)
- Do NOT add Claude/AI as co-author or contributor
