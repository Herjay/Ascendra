# Data Journey — Architecture & System Design

## 1. High-Level Overview
**Data Journey** is a client-side, offline-first application engineered to track long-term personal productivity, skill development journeys, and software projects. Its primary design principle is **zero cloud dependency, zero recurring cost, and 100% user data sovereignty**.

```
+-----------------------------------------------------------------------+
|                             USER BROWSER                              |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                       UI / Presentation                       |   |
|   |   index.html + tokens.css + base.css + components.css         |   |
|   +---------------------------------------------------------------+   |
|                                  |                                    |
|   +---------------------------------------------------------------+   |
|   |                     Router & Modules (ES6)                    |   |
|   |   app.js • router.js • dashboard • projects • daily • tasks   |   |
|   |   goals • issues • timeTracker • calendar • analytics • backup|   |
|   +---------------------------------------------------------------+   |
|               |                                   |                   |
|   +-----------------------+           +-----------------------+       |
|   |   Services & Utils    |           |   Service Worker      |       |
|   |   healthService       |           |   service-worker.js   |       |
|   |   streakService       |           |   Cache API           |       |
|   |   searchService       |           |   (Offline Assets)    |       |
|   |   dateUtils / uuid    |           +-----------------------+       |
|   +-----------------------+                       |                   |
|               |                                   |                   |
|   +---------------------------------------------------------------+   |
|   |                     IndexedDB Layer                           |   |
|   |   db.js (Promise Wrapper)                                     |   |
|   |   DataJourneyDB (9 Object Stores, Indexes, Migrations)        |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

## 2. Key Architectural Decisions

### A. Zero Backend & 100% Local Storage
- **Decision**: Avoid Node/Python/PHP servers, Firebase, or external cloud databases for runtime operation.
- **Rationale**: Guarantees that the app remains functional even in airplane mode, during network outages, or on air-gapped workstations. No subscriptions or server maintenance required.

### B. Vanilla Web Technologies (HTML5, CSS3, ES6+ Modules)
- **Decision**: Zero heavy frontend framework dependencies (e.g. React, Angular, Vue).
- **Rationale**: Eliminates build-step fragility, node_modules bloat, and dependency deprecation. The application code can run directly in standard browsers today and decades from now.

### C. IndexedDB as Primary Storage
- **Decision**: Use browser IndexedDB (`DataJourneyDB`) instead of `localStorage`.
- **Rationale**: `localStorage` is synchronous, limited to ~5MB, and easily exhausted by multi-project logs. IndexedDB provides asynchronous, indexed queries with hundreds of megabytes of capacity.

### D. Portable JSON Backup & Recovery
- **Decision**: Full backup export and smart merge/restore import capabilities with JSON schema validation.
- **Rationale**: Browser caches can occasionally be cleared by the OS. Providing 1-click JSON backup downloads ensures users never lose their study notes or streak history.

### E. Built-in Lightweight Windows Launcher
- **Decision**: Supply `start-app.bat` and `server.ps1` utilizing Windows PowerShell's native `System.Net.HttpListener`.
- **Rationale**: Enables instant local hosting (`http://localhost:8080`) on any standard Windows PC without requiring Node.js or Python, providing full PWA and Service Worker capabilities out of the box.
