# Data Journey — Testing & Quality Assurance Protocol

## 1. Quality Assurance Matrix

| Test Category | Test Case | Expected Result | Status |
|---------------|-----------|-----------------|--------|
| **Server & Assets** | Launch `server.ps1` on port 8080 | Returns HTTP 200 with correct MIME types for HTML, CSS, JS, SVG, JSON | PASS |
| **PWA Manifest** | Fetch `/manifest.json` | Valid JSON with name, icons, start_url, and standalone display | PASS |
| **Service Worker** | Fetch `/service-worker.js` | Returns valid JS; activates and caches assets into Cache API | PASS |
| **Data Persistence** | Insert records into IndexedDB (`DataJourneyDB`) | Records persist across tab close and page refresh | PASS |
| **Multi-Project** | Create 2 projects; switch between them | Dashboard and modules update context to active project | PASS |
| **Daily Progress** | Record Day progress with reflection notes | Appears in timeline, updates streak and actual hours | PASS |
| **Task Management** | Add task, toggle completion checkbox | Task crosses out, completion velocity counter increments | PASS |
| **Time Tracking** | Run stopwatch, click Log Session | Session logged in minutes, added to project total | PASS |
| **Calendar** | Navigate months, click dates | Displays study session details and milestones | PASS |
| **Export / Import** | Download JSON backup, modify, and restore | Schema validates; records restored without data corruption | PASS |
| **Demo Data Isolation**| Load demo dataset, then clear demo data | Only records with `isDemo: true` are deleted; user data untouched | PASS |
| **Offline Test** | Turn off network connectivity | Application loads from cache, IndexedDB reads/writes normally | PASS |
| **Theme System** | Toggle Dark / Light mode | CSS variables swap seamlessly; preference stored in `localStorage` | PASS |

---

## 2. Manual Verification Checklist
1. Launch `start-app.bat`.
2. Verify Dashboard KPIs: Active Projects, Hours Logged, Current Streak, Tasks Completed.
3. Test Global Search: Type `SQL` or `Pandas` into the search bar (`Ctrl+K`) and click a result.
4. Test Theme: Toggle theme button in header to verify Light and Dark appearances.
5. Test Daily Logging: Log a daily record with a Breakthrough and confirm it appears under Roadblocks & Wins.
6. Test Export: Go to Data & Backups and verify the generated JSON file contains all stores.
