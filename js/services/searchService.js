/**
 * Data Journey - Global Search & Multi-Entity Filter Service
 * Section 5.12 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';

export class SearchService {
  /**
   * Performs an instant search across all stores
   * @param {string} query - Keyword search term
   * @param {string} [projectId] - Optional project filter
   */
  static async searchAll(query, projectId = null) {
    if (!query || query.trim().length < 2) return [];

    const term = query.toLowerCase().trim();
    const results = [];

    // 1. Projects
    const projects = await Database.getAll(STORES.PROJECTS);
    projects.forEach((p) => {
      if (
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.type && p.type.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Project',
          icon: '📁',
          title: p.name,
          subtitle: `${p.type} • Status: ${p.status}`,
          targetRoute: '#projects',
          item: p
        });
      }
    });

    // 2. Daily Progress
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    dailyRecords.forEach((d) => {
      if (projectId && d.projectId !== projectId) return;
      if (
        (d.sectionWorkedOn && d.sectionWorkedOn.toLowerCase().includes(term)) ||
        (d.whatILearned && d.whatILearned.toLowerCase().includes(term)) ||
        (d.breakthrough && d.breakthrough.toLowerCase().includes(term)) ||
        (d.challenge && d.challenge.toLowerCase().includes(term)) ||
        (d.notes && d.notes.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Daily Progress',
          icon: '📅',
          title: `Day ${d.dayNumber}: ${d.sectionWorkedOn || d.date}`,
          subtitle: d.whatILearned ? `Learned: ${d.whatILearned.slice(0, 75)}...` : d.date,
          targetRoute: '#daily',
          item: d
        });
      }
    });

    // 3. Tasks
    const tasks = await Database.getAll(STORES.TASKS);
    tasks.forEach((t) => {
      if (projectId && t.projectId !== projectId) return;
      if (
        (t.title && t.title.toLowerCase().includes(term)) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        (t.category && t.category.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Task',
          icon: '✓',
          title: t.title,
          subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
          targetRoute: '#tasks',
          item: t
        });
      }
    });

    // 4. Goals
    const goals = await Database.getAll(STORES.GOALS);
    goals.forEach((g) => {
      if (projectId && g.projectId !== projectId) return;
      if (
        (g.title && g.title.toLowerCase().includes(term)) ||
        (g.description && g.description.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Goal',
          icon: '🎯',
          title: g.title,
          subtitle: `Target: ${g.targetDate || 'No date'} • ${g.progress || 0}%`,
          targetRoute: '#goals',
          item: g
        });
      }
    });

    // 5. Issues
    const issues = await Database.getAll(STORES.ISSUES);
    issues.forEach((i) => {
      if (projectId && i.projectId !== projectId) return;
      if (
        (i.title && i.title.toLowerCase().includes(term)) ||
        (i.description && i.description.toLowerCase().includes(term)) ||
        (i.possibleSolution && i.possibleSolution.toLowerCase().includes(term)) ||
        (i.actualSolution && i.actualSolution.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Issue',
          icon: '⚠️',
          title: i.title,
          subtitle: `Severity: ${i.severity} • Status: ${i.status}`,
          targetRoute: '#issues',
          item: i
        });
      }
    });

    // 6. Breakthroughs
    const breakthroughs = await Database.getAll(STORES.BREAKTHROUGHS);
    breakthroughs.forEach((b) => {
      if (projectId && b.projectId !== projectId) return;
      if (
        (b.title && b.title.toLowerCase().includes(term)) ||
        (b.description && b.description.toLowerCase().includes(term)) ||
        (b.category && b.category.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'Breakthrough',
          icon: '💡',
          title: b.title,
          subtitle: `${b.category || 'General'} • Date: ${b.date}`,
          targetRoute: '#issues',
          item: b
        });
      }
    });

    return results;
  }
}
