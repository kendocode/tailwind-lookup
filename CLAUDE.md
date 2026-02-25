# Tailwind CSS Lookup — Chrome Extension

## What This Is
A Chrome extension that lets developers inspect Tailwind CSS classes on any element in the browser. Search any class to see the CSS it generates. The missing browser companion for Tailwind developers.

## Architecture
- **content.js** — Content script injected on all pages. Handles inspect mode (hover overlay showing Tailwind classes), click-to-copy, and page scanning for Tailwind class detection.
- **content.css** — Styles for the inspect mode overlay and hover tooltip.
- **background.js** — Service worker handling messaging between popup and content scripts.
- **popup/** — Browser action popup with class search input, page summary, and inspect mode toggle.
- **options/** — Options page for theme and behavior preferences.
- **data/tailwind-classes.json** — Complete Tailwind CSS v3 class database mapping class names to their CSS output.
- **icons/** — Extension icons (16, 48, 128px).

## Key Implementation Details
- Inspect mode activates via popup button, injects hover overlay on the active tab
- Class database is a JSON file loaded as a web-accessible resource
- Page summary scans all elements' classList for known Tailwind classes
- Escape key exits inspect mode
- Popup communicates with content script via `chrome.tabs.sendMessage`

## Running Tests
```bash
node tests/test-core.mjs
```
- 330 unit tests covering class lookup, search, page scanning, overlay rendering

## Conventions
- Manifest V3, no external dependencies
- Version: semver starting at 0.x (1.x = production-ready)
- Privacy policy must be kept current with any permission changes
- Do NOT add Claude/AI as co-author or contributor in commits, PRs, or code
