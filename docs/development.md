# Data Journey — Development & Contributor Guide

## 1. Project Structure
```
Progress Tracker/
├── index.html                  # Single page application shell & markup
├── manifest.json               # Web App Manifest for PWA installation
├── service-worker.js           # Offline caching service worker
├── server.ps1                  # Native PowerShell static HTTP server
├── start-app.bat               # 1-click Windows runner
├── README.md                   # Repository overview
├── assets/
│   ├── icons/                  # Vector SVG icons (192x192, 512x512)
│   └── css/
│       ├── tokens.css          # Design tokens (colors, gradients, themes)
│       ├── base.css            # Reset, typography, app shell layout
│       ├── components.css      # Buttons, cards, modals, tables, metrics
│       └── print.css           # Print & PDF export styles
├── js/
│   ├── app.js                  # Main orchestrator & lifecycle manager
│   ├── router.js               # Client-side hash routing
│   ├── database/
│   │   ├── schema.js           # Object store & index configurations
│   │   └── db.js               # Promise-based IndexedDB engine
│   ├── modules/                # Feature views
│   │   ├── dashboard.js
│   │   ├── projects.js
│   │   ├── daily.js
│   │   ├── tasks.js
│   │   ├── goals.js
│   │   ├── issues.js
│   │   ├── timeTracker.js
│   │   ├── calendar.js
│   │   ├── analytics.js
│   │   └── backup.js
│   ├── services/               # Reusable business logic
│   │   ├── healthService.js
│   │   ├── streakService.js
│   │   └── searchService.js
│   └── utils/                  # Helper utilities
│       ├── dom.js
│       ├── dateUtils.js
│       ├── uuid.js
│       └── demoData.js
└── docs/                       # Technical documentation
```

## 2. Coding Conventions
- **Pure ES6+ Modules**: Use standard `import` / `export` syntax. No transpilation step or build tool required.
- **Vanilla CSS3 Custom Properties**: All colors, margins, and typography must reference CSS variables declared in `assets/css/tokens.css`.
- **Pure DOM & Web APIs**: Keep dependencies to zero. Use `document.createElement`, SVG elements, and standard events.
- **Asynchronous Storage**: All database interactions are asynchronous and return Promises via `Database.get()`, `Database.put()`, etc.

## 3. Adding a New Feature Module
1. Create `js/modules/myFeature.js`.
2. Implement a `static async render(container, activeProject)` method.
3. Add the navigation route in `js/router.js` and `js/app.js`.
4. Add the navigation link in `index.html`.
5. Add the asset path to `service-worker.js` cache list.
