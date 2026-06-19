# Contributing to Submap

Submap is a privacy-first finance tracker. Contributions are welcome — especially UI improvements, new chart types, and better PWA behavior.

## What is welcome

- Bug fixes
- New transaction categories or default budgets
- Better chart visualizations (Recharts)
- Accessibility improvements
- Multi-currency additions (USD, EUR, INR, GBP — and more)
- Performance improvements
- PWA / offline behavior fixes
- Export/import improvements

## How to test locally

1. Clone: `git clone https://github.com/Rishiidev/Submap-App.git`
2. Install: `npm install`
3. Run: `npm run dev` — opens at `http://localhost:3000`
4. Test your change — add a transaction, check the budget view, toggle dark mode
5. TypeScript check: `npm run lint`

Every PR should include a **before/after** description of what changed in the UI or data behavior.

## PR format

- One focused change per PR
- Include a before/after description or screenshot
- Run `npm run lint` before submitting — CI will block on TypeScript errors

## What never changes

- **Local-only storage.** No cloud sync, no accounts, no external API calls for user data.
- **Zero required backend.** The app must work as a purely static site.
- **Privacy-first.** No analytics tracking scripts, no user fingerprinting.

## Good first issues

Check the [good first issue](https://github.com/Rishiidev/Submap-App/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label for beginner-friendly tasks.
