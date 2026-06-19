# 💰 Submap — Finance Tracking With Zero Cloud

<div align="center">

**Track every dollar you earn and spend — without sending a single byte to the cloud.**

[![Stars](https://img.shields.io/github/stars/Rishiidev/Submap-App?style=for-the-badge&color=gold)](https://github.com/Rishiidev/Submap-App/stargazers)
[![CI](https://github.com/Rishiidev/Submap-App/actions/workflows/validate.yml/badge.svg)](https://github.com/Rishiidev/Submap-App/actions)
[![License](https://img.shields.io/github/license/Rishiidev/Submap-App?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)](https://github.com/Rishiidev/Submap-App/releases)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)](https://submap.vercel.app/)

*Works in any browser · Installable as an app · 100% offline-capable*

</div>

> A privacy-first PWA finance tracker for freelancers and individuals who refuse to hand their financial data to a cloud service. All data lives in your browser's localStorage — no account, no sync, no leak.

---

## The Problem

Every finance app wants to connect to your bank. The ones that don't still sync your transactions to their servers — meaning your salary, your recurring subscriptions, and your spending habits are sitting in a database you don't control.

```
Most finance trackers require:
  ✗ Account creation + email verification
  ✗ Bank login / OAuth / Plaid connection
  ✗ Data synced to their cloud
  ✗ Internet connection to view your own data
  ✗ Trusting a third party with your net worth
```

## The Fix

Submap stores everything in your browser's `localStorage`. Open the app, track your money, close it — nothing left your device.

```
Submap approach:
  ✓ Zero account required — open and use immediately
  ✓ All data stays in your browser
  ✓ Works 100% offline once loaded
  ✓ Installable to home screen like a native app
  ✓ Your financial data = your business only
```

## Use It Now

| Platform | How |
|----------|-----|
| **Live web app** | [submap.vercel.app](https://submap.vercel.app/) |
| **iOS (add to home screen)** | Open in Safari → Share → Add to Home Screen |
| **Android (install as app)** | Open in Chrome → Menu → Install app |
| **Self-host** | Clone → `npm run build` → deploy to Vercel/Netlify/any static host |

---

<div align="center">
<b>If this saves you from another finance app asking for your bank login, star it — takes 2 seconds.</b><br><br>
<a href="https://github.com/Rishiidev/Submap-App">⭐ Star on GitHub</a>
</div>

---

## Features

| Feature | What it does |
|---------|-------------|
| **Local Storage Only** | 100% browser-side — no database, no cloud sync, no account |
| **Expense & Income Tracking** | Add, edit, delete transactions with full category support |
| **Recurring Transactions** | Weekly / monthly / yearly recurrences with auto-generation |
| **Custom Categories** | Create categories with icons, colors, and monthly budget limits |
| **Budget Alerts** | Set per-category spending limits and see budget health at a glance |
| **Analytics Dashboard** | Interactive charts: net flow, category breakdown, multi-month trends |
| **Multi-Currency** | USD, EUR, INR, GBP with locale-correct number formatting |
| **Dark Mode** | Full dark / light / high-contrast theme support |
| **PWA Ready** | Installable on iOS and Android, works fully offline |
| **Transaction Tags & Notes** | Add freeform tags and notes to any transaction |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 3 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Storage | Browser localStorage |

## Getting Started

### Prerequisites

Node.js v18 or higher.

### Run Locally

```bash
git clone https://github.com/Rishiidev/Submap-App.git
cd Submap-App
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
# Output: dist/ — deploy to Vercel, Netlify, or any static host
```

## What Gets Tracked

| Data | Where it lives |
|------|---------------|
| Transactions | `localStorage` in your browser |
| Categories & budgets | `localStorage` in your browser |
| Settings & theme | `localStorage` in your browser |
| Recurring rules | `localStorage` in your browser |

## What Never Gets Touched

| Protected | Why |
|-----------|-----|
| Your bank account | No bank sync, ever |
| A server database | Zero backend — pure frontend |
| Third-party analytics | No tracking scripts included |
| Your identity | No account, no email, no login |

## PWA Install

**iOS (Safari)**

1. Open [submap.vercel.app](https://submap.vercel.app/) in Safari
2. Tap the Share icon at the bottom
3. Scroll down and tap **Add to Home Screen**

**Android (Chrome)**

1. Open [submap.vercel.app](https://submap.vercel.app/) in Chrome
2. Tap the three-dot menu (top right)
3. Tap **Install app** or **Add to Home screen**

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Rishiidev/Submap-App&type=Date)](https://star-history.com/#Rishiidev/Submap-App&Date)

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
<b>Found Submap useful? A ⭐ star helps others find it.</b><br><br>
<a href="https://github.com/Rishiidev/Submap-App">⭐ Star this repo</a>
</div>
