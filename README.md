# Submap


**Submap** is a privacy-first, offline-capable Progressive Web App (PWA) designed to give you a clear, comprehensive view of your finances. Originally conceived as a minimal finance tracker, it has evolved into a robust tool to manage expenses, track income, and monitor subscription costs—all from your browser or mobile home screen.

## ✨ Features

- **Privacy-First (Local Storage):** All financial data is stored securely in your browser's local storage. No databases, no cloud sync, complete privacy.
- **PWA Ready (Installable):** Add Submap to your iOS or Android home screen for a seamless, app-like experience. Works fully offline.
- **Budgeting & Categories:** Create custom categories for expenses and income. Set monthly budgets to stop overspending before it happens.
- **Insights & Analytics:** View your financial health at a glance with interactive charts. Track money in vs. money out across multiple months.
- **Dark Mode Support:** Beautiful dark mode interface crafted with Tailwind CSS for night-time tracking.
- **Multi-Currency:** Support for various localized currency formats.

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Recharts** (Data Visualization)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rishiidev/Submap-App.git
   cd Submap-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`*

### Production Build

To build the app for production (Vercel, Netlify, or static hosting):

```bash
npm run build
```

This will output a minified app in the `dist` directory. A `_redirects` file is included in the `public` folder to ensure client-side routing works smoothly on platforms like Netlify.

## 📱 Progressive Web App (PWA) Setup

Submap is configured as a standalone PWA. When users visit the live application, they can add it to their home screen:
1. **iOS (Safari):** Tap the Share icon at the bottom, then scroll down and tap **"Add to Home Screen"**.
2. **Android (Chrome):** Tap the three-dot menu icon in the top right, then tap **"Add to Home screen"** or **"Install app"**.

## 📄 License

This project is licensed under the MIT License.
