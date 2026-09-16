# Ascendra 🚀

> **Offline-First • Multi-Project • Installable • 100% Data Sovereignty**

<p align="center">
  <img src="assets/icons/ascendra-logo.png" alt="Ascendra Logo" width="128" height="128" style="border-radius: 24px;" />
</p>

Ascendra is a standalone, offline-first personal productivity and skill development tracker designed to support long-term learning curves, software projects, and daily habit consistency.

Its flagship template is a **35-Day Data Analyst Learning Journey** (1 hour per day for 35 days), but its modular architecture natively supports unlimited concurrent learning, software, and research projects.

---

## ✨ Features

- 📶 **100% Offline-First**: Operates seamlessly without an internet connection using browser-native **IndexedDB** and **Service Worker** caching.
- 📱 **Installable Progressive Web App (PWA)**: Install directly to your Windows desktop, macOS dock, Android home screen, or iOS device as a standalone application window.
- 📁 **Multi-Project Management**: Support for unlimited learning curves, coding portfolios, and research projects with configurable target days, daily hours, and health metrics.
- 📅 **Daily Progress Reflections**: Record daily time, topics studied, goals, *"What I Learned"*, *"💡 Breakthroughs"*, and *"⚠️ Challenges/Roadblocks"*.
- ⏱️ **Interactive Study Stopwatch**: Integrated focus timer that logs finished sessions directly into your project's history.
- 📊 **Consistency Heatmap**: Visual GitHub-style daily activity grid highlighting daily study intensity and streak momentum.
- 📈 **Zero-Dependency SVG Analytics**: Visual velocity charts, planned vs. actual hours comparisons, and milestone completion percentages.
- 🗓️ **Journey Calendar**: Monthly calendar with color-coded completed days, partial sessions, and upcoming task/goal deadlines.
- 🔍 **Global Instant Search (`Ctrl+K`)**: Rapid keyword search across projects, tasks, daily reflections, breakthroughs, and issues.
- 💾 **Data Ownership & JSON Portability**: 1-click JSON backup export, verified schema import (with Full Restore and Smart Merge modes), and isolated demo data management.
- 🌓 **Sleek Theme System**: Curated Dark and Light themes with fluid glassmorphic accents and high-contrast typography.
- 🖨️ **Native PDF / Print Export**: Beautiful `@media print` layout to print daily summaries and project progress reports via `Ctrl+P`.

---

## 🚀 1-Click Launch on Windows

1. Navigate to this directory:
   ```
   C:\Users\ICT\Desktop\Progress Tracker\
   ```
2. Double-click **`start-app.bat`**.
3. Your browser will open to `http://localhost:8080/` with the application ready to use!

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom Properties & Tokens), ES6+ Modular JavaScript.
- **Storage**: Browser IndexedDB (`DataJourneyDB`) with Promise transactions.
- **PWA**: Web App Manifest (`manifest.json`) and Cache API Service Worker (`service-worker.js`).
- **Charts**: Zero-dependency SVG visual data rendering.
- **Local Server**: Native Windows PowerShell static server (`server.ps1`).

---

## 📚 Documentation

- [Architecture & System Design](docs/architecture.md)
- [Database Schema & Stores](docs/database.md)
- [Installation & PWA Setup](docs/installation.md)
- [User Guide & Workflows](docs/user-guide.md)
- [Development & Contributor Guide](docs/development.md)
- [Testing & QA Protocols](docs/testing.md)
- [Static Hosting & Deployment](docs/deployment.md)

---

## 📄 License

MIT License. Designed for personal and open productivity.
