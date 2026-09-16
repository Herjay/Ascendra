/**
 * Data Journey - Database Schema Definition & Store Config
 */

export const DB_NAME = 'DataJourneyDB';
export const DB_VERSION = 1;

export const STORES = {
  PROJECTS: 'projects',
  DAILY_PROGRESS: 'dailyProgress',
  TASKS: 'tasks',
  GOALS: 'goals',
  ISSUES: 'issues',
  BREAKTHROUGHS: 'breakthroughs',
  TIME_ENTRIES: 'timeEntries',
  NOTES: 'notes',
  SETTINGS: 'settings'
};

/**
 * Object Store Configurations: Key paths and indexes
 */
export const SCHEMA_DEFINITIONS = {
  [STORES.PROJECTS]: {
    keyPath: 'id',
    indexes: [
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'type', keyPath: 'type', unique: false },
      { name: 'priority', keyPath: 'priority', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  [STORES.DAILY_PROGRESS]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'dayNumber', keyPath: 'dayNumber', unique: false },
      { name: 'project_date', keyPath: ['projectId', 'date'], unique: true }
    ]
  },
  [STORES.TASKS]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'priority', keyPath: 'priority', unique: false },
      { name: 'dueDate', keyPath: 'dueDate', unique: false }
    ]
  },
  [STORES.GOALS]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'targetDate', keyPath: 'targetDate', unique: false }
    ]
  },
  [STORES.ISSUES]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'status', keyPath: 'status', unique: false },
      { name: 'severity', keyPath: 'severity', unique: false },
      { name: 'date', keyPath: 'date', unique: false }
    ]
  },
  [STORES.BREAKTHROUGHS]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'category', keyPath: 'category', unique: false }
    ]
  },
  [STORES.TIME_ENTRIES]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'date', keyPath: 'date', unique: false },
      { name: 'taskId', keyPath: 'taskId', unique: false }
    ]
  },
  [STORES.NOTES]: {
    keyPath: 'id',
    indexes: [
      { name: 'projectId', keyPath: 'projectId', unique: false },
      { name: 'createdAt', keyPath: 'createdAt', unique: false }
    ]
  },
  [STORES.SETTINGS]: {
    keyPath: 'key'
  }
};
