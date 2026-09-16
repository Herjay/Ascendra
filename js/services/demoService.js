/**
 * Ascendra - Demo Service
 * Handles identification, safe deletion, and restoration of sample/demo project data.
 * Sections 17-24 of Product Update Specification (ASCENDRA.docx)
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { getDemoDataset } from '../utils/demoData.js';

export class DemoService {
  static DEMO_PROJECT_ID = 'demo-project-35day-data-analyst';

  /**
   * Check if a project or record is demo data
   */
  static isDemo(item) {
    if (!item) return false;
    return item.isDemo === true || item.id === this.DEMO_PROJECT_ID || item.projectId === this.DEMO_PROJECT_ID;
  }

  /**
   * Check if the demo project currently exists in IndexedDB
   */
  static async hasDemoData() {
    try {
      const project = await Database.get(STORES.PROJECTS, this.DEMO_PROJECT_ID);
      return Boolean(project);
    } catch {
      return false;
    }
  }

  /**
   * Check if the user has explicitly dismissed/deleted the demo data
   */
  static async isDemoDismissed() {
    try {
      const setting = await Database.get(STORES.SETTINGS, 'demoDismissed');
      return Boolean(setting && setting.value === true);
    } catch {
      return false;
    }
  }

  /**
   * Safely and completely remove the demo project and all associated sample records.
   * Protects all real user projects and data.
   */
  static async removeDemoData() {
    console.log('[DemoService] Removing demo project and all associated records...');

    // 1. Delete demo project from PROJECTS store
    try {
      await Database.delete(STORES.PROJECTS, this.DEMO_PROJECT_ID);
    } catch (e) {
      console.warn('[DemoService] Error deleting demo project:', e);
    }

    // 2. Stores to sweep for demo records
    const storesToClean = [
      STORES.DAILY_PROGRESS,
      STORES.TASKS,
      STORES.GOALS,
      STORES.ISSUES,
      STORES.BREAKTHROUGHS,
      STORES.TIME_ENTRIES,
      STORES.NOTES
    ];

    for (const storeName of storesToClean) {
      try {
        const records = await Database.getAll(storeName);
        for (const record of records) {
          if (record.projectId === this.DEMO_PROJECT_ID || record.isDemo === true) {
            await Database.delete(storeName, record.id);
          }
        }
      } catch (err) {
        console.warn(`[DemoService] Error cleaning store ${storeName}:`, err);
      }
    }

    // 3. Set persistent flag so app never recreates demo on refresh, restart, or offline launches
    await Database.put(STORES.SETTINGS, { key: 'demoDismissed', value: true });

    // 4. Update active project if it was currently set to the demo project
    try {
      const activeSetting = await Database.get(STORES.SETTINGS, 'activeProjectId');
      if (activeSetting && activeSetting.value === this.DEMO_PROJECT_ID) {
        const remainingProjects = await Database.getAll(STORES.PROJECTS);
        const nextActiveId = remainingProjects.length > 0 ? remainingProjects[0].id : null;
        await Database.put(STORES.SETTINGS, { key: 'activeProjectId', value: nextActiveId });
      }
    } catch (e) {
      console.warn('[DemoService] Error updating activeProjectId setting:', e);
    }

    console.log('[DemoService] Demo data removal complete. Deletion is persistent.');
  }

  /**
   * Restore demo data without overwriting or deleting any existing user projects
   */
  static async restoreDemoData() {
    console.log('[DemoService] Restoring demo project...');

    // Prevent duplicate loading if already present
    const alreadyExists = await this.hasDemoData();
    if (alreadyExists) {
      return false;
    }

    const demo = getDemoDataset();

    await Database.bulkPut(STORES.PROJECTS, demo.projects);
    await Database.bulkPut(STORES.DAILY_PROGRESS, demo.dailyProgress);
    await Database.bulkPut(STORES.TASKS, demo.tasks);
    await Database.bulkPut(STORES.GOALS, demo.goals);
    await Database.bulkPut(STORES.ISSUES, demo.issues);
    await Database.bulkPut(STORES.BREAKTHROUGHS, demo.breakthroughs);
    await Database.bulkPut(STORES.TIME_ENTRIES, demo.timeEntries);
    await Database.bulkPut(STORES.NOTES, demo.notes);

    // Reset the dismissed flag
    await Database.put(STORES.SETTINGS, { key: 'demoDismissed', value: false });

    // If no active project, switch to the restored demo project
    const activeSetting = await Database.get(STORES.SETTINGS, 'activeProjectId');
    if (!activeSetting || !activeSetting.value) {
      await Database.put(STORES.SETTINGS, { key: 'activeProjectId', value: this.DEMO_PROJECT_ID });
    }

    console.log('[DemoService] Demo project restored.');
    return true;
  }
}
