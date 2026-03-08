<p align="center">
  <img src="https://github.com/user-attachments/assets/cdf6148c-1c85-49e6-ac2f-e065776f5ea7" alt="Banny" width="250" height="250" />
</p>

<h1 align="center">Banny</h1>
<p align="center">
  <strong>Your little design friend with great taste.</strong>
</p>
<p align="center">
  Create social media banners and hero shots in the browser.
</p>

<p align="center">
  <strong>Live:</strong> <a href="https://niclassslua.github.io/banny/">https://niclassslua.github.io/banny/</a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a>
</p>

---

## ✨ Features

- **50+ CSS patterns** — Atmospheric, radial, geometric, angular, organic, and playful styles
- **Live typography** — Font style (bold, italic, underline, strikethrough), size, alignment, 24+ fonts, text color
- **Two-tone + scale** — Two pattern colors and a scale slider for instant visual tweaks
- **PNG export** — One-click download of the current banner as PNG
- **Preset import/export** — Save and load full workspace state as JSON
- **Auto-save** — Workspace state persisted in `localStorage`
- **i18n** — German and English UI (switch in the header)
- **Responsive** — Works on desktop and tablet; sticky sidebar and clear layout

---

## 🖼️ Screenshot

<img width="1296" height="1301" alt="Bildschirmfoto 2026-02-24 um 01 36 33" src="https://github.com/user-attachments/assets/f7bc6a37-4e92-411c-b890-879994787bae" />

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/bannercreator.git
cd bannercreator
npm install
npm run dev
```

Open **http://localhost:3002** and click **Launch the creator** (or go to `/creator`).

---

## 📦 Deployment (GitHub Pages)

The repo is set up for automatic deployment to **GitHub Pages** via GitHub Actions:

1. **Enable GitHub Pages** in the repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.
2. Push to `main` (or run the workflow manually). The workflow builds a static export and deploys it.

**Live URL** (when the repo is `Niclassslua/banny`):

- **https://niclassslua.github.io/banny/**

The app is built with `output: 'export'` and `basePath: '/banny'`, so it works correctly under the project path.

---

## 🛠 Tech Stack

| Area        | Tech |
|------------|------|
| Framework   | [Next.js](https://nextjs.org) 15 (App Router) |
| UI         | React 19, [Tailwind CSS](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) |
| Icons      | [Lucide](https://lucide.dev), [Tabler Icons](https://tabler.io/icons), [React Icons](https://react-icons.github.io/react-icons/) |
| i18n       | [next-intl](https://next-intl.dev) |
| Export     | [html-to-image](https://github.com/bubkoo/html-to-image) (PNG) |
| Tests      | [Jest](https://jestjs.io), [Testing Library](https://testing-library.com/react) |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── creator/page.tsx      # Creator workspace (orchestrator)
│   └── layout.tsx            # Root layout (i18n + notifications)
├── components/
│   ├── Sidebar/               # Typography controls
│   ├── Preview/               # BannerPreview
│   ├── Settings/              # Colors & scale panel
│   ├── Notifications/          # Toast provider
│   └── atoms | molecules | organisms/
├── constants/
│   ├── patterns.ts            # 50+ pattern definitions + category labels
│   ├── colors.ts
│   └── fonts.ts
├── hooks/
│   ├── useWorkspaceState.ts   # State + localStorage persist
│   └── usePatternFilters.ts  # Category filter + filtered list
├── utils/
│   ├── parseCSS.ts            # Pattern CSS → inline styles
│   ├── fileName.ts            # sanitizeFileName
│   ├── validation.ts          # isValidWorkspaceState, isValidTextStyles
│   ├── downloadBanner.ts      # PNG export
│   ├── exportWorkspace.ts     # Preset JSON export
│   └── importWorkspace.ts     # Preset JSON import + validation
├── messages/
│   ├── de.json
│   └── en.json
└── i18n/
    └── request.ts             # Default locale for static export; client switch via LocaleProvider
```

---

## 🌐 Routes

| Path       | Description |
|------------|-------------|
| `/`        | Landing page — hero, features, CTA to creator |
| `/creator` | Full workspace — sidebar, preview, pattern grid, colors & scale, export/import/reset/download |

---

## 📄 License

MIT. See [LICENSE](LICENSE) for details.
