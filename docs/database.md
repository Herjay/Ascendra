# Data Journey — Database Architecture & Schema Specification

## 1. Database Overview
- **Database Name**: `DataJourneyDB`
- **Engine**: IndexedDB (Browser Native W3C Standard)
- **Current Version**: `1`
- **Data Access Layer**: `js/database/db.js` (Promise-based asynchronous transaction wrapper)

---

## 2. Object Stores & Index Specifications

### 1. `projects`
Stores high-level learning challenges and projects.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `status`: Project lifecycle state (`In Progress`, `Completed`, `Archived`)
  - `type`: Category (`Learning`, `Software`, `Portfolio`, `Research`, `Business`, `Other`)
  - `priority`: Urgency (`High`, `Medium`, `Low`)
  - `createdAt`: ISO 8601 creation timestamp
- **Key Fields**:
  - `name`: String (Project title)
  - `description`: String (Scope and syllabus)
  - `plannedDurationDays`: Number (e.g. 35)
  - `dailyTargetHours`: Number (e.g. 1.0)
  - `totalTargetHours`: Number (e.g. 35.0)
  - `startDate`: String (YYYY-MM-DD)
  - `targetDate`: String (YYYY-MM-DD)
  - `isDemo`: Boolean (Optional flag for sample records)

### 2. `dailyProgress`
Daily learning logs, time spent, reflections, and breakthrough notes.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key linking to `projects.id`
  - `date`: YYYY-MM-DD date string
  - `dayNumber`: Integer (e.g. Day 1, Day 2 ... Day 35)
  - `project_date`: Compound unique index `[projectId, date]`
- **Key Fields**:
  - `sectionWorkedOn`: String (Topic studied)
  - `actualMinutes`: Number (Duration in minutes)
  - `plannedMinutes`: Number (Target in minutes)
  - `dailyGoal`: String (Target for the day)
  - `whatILearned`: String (Key reflections)
  - `breakthrough`: String (Aha! moments)
  - `challenge`: String (Blockers / errors)
  - `status`: String (`Completed`, `Partial`, `Missed`)

### 3. `tasks`
Actionable granular tasks and exercises.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `status`: `Todo`, `In Progress`, `Completed`
  - `priority`: `High`, `Medium`, `Low`
  - `dueDate`: YYYY-MM-DD string
- **Key Fields**:
  - `title`: String
  - `estimatedMinutes`: Number
  - `actualMinutes`: Number
  - `category`: String

### 4. `goals`
Milestones and progress markers.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `status`: `In Progress`, `Completed`, `On Hold`
  - `targetDate`: YYYY-MM-DD
- **Key Fields**:
  - `title`: String
  - `progress`: Number (0–100%)
  - `priority`: `High`, `Medium`, `Low`

### 5. `issues`
Roadblocks, bugs, and verified solutions.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `status`: `Open`, `Investigating`, `Resolved`
  - `severity`: `High`, `Medium`, `Low`
  - `date`: YYYY-MM-DD
- **Key Fields**:
  - `title`: String
  - `description`: String
  - `possibleSolution`: String
  - `actualSolution`: String
  - `resolutionDate`: String

### 6. `breakthroughs`
Wins, insights, and major conceptual breakthroughs.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `date`: YYYY-MM-DD
  - `category`: `Technical`, `Efficiency`, `Milestone`, `Mindset`
- **Key Fields**:
  - `title`: String
  - `importance`: `High`, `Medium`
  - `description`: String

### 7. `timeEntries`
Session logs recorded via stopwatch or manual entry.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `date`: YYYY-MM-DD
  - `taskId`: Optional reference to `tasks.id`
- **Key Fields**:
  - `durationMinutes`: Number
  - `category`: String
  - `description`: String

### 8. `notes`
General documentation, cheat sheets, and references.
- **Key Path**: `id` (String, UUID)
- **Indexes**:
  - `projectId`: Foreign key
  - `createdAt`: ISO 8601 string
- **Key Fields**:
  - `title`: String
  - `content`: String (Markdown/Text)

### 9. `settings`
Key-value pair store for user preferences.
- **Key Path**: `key` (String, e.g. `activeProjectId`, `theme`, `paceAheadThreshold`)
- **Key Fields**:
  - `value`: Any

---

## 3. Version Migration & Upgrades
Upgrades are managed in `js/database/db.js` via the `onupgradeneeded` lifecycle hook. When incrementing `DB_VERSION`:
1. Check `event.oldVersion`.
2. Apply delta changes (e.g. creating new object stores or adding new indexes) without mutating existing stored data.
