/**
 * Data Journey - Analytics & Visual SVG Charts Module
 * Section 17 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { StreakService } from '../services/streakService.js';
import { formatMinutes } from '../utils/dateUtils.js';

export class AnalyticsModule {
  static async render(container, activeProject) {
    const projects = await Database.getAll(STORES.PROJECTS);
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    const tasks = await Database.getAll(STORES.TASKS);
    const goals = await Database.getAll(STORES.GOALS);
    const timeEntries = await Database.getAll(STORES.TIME_ENTRIES);

    const projectDaily = activeProject
      ? dailyRecords.filter((d) => d.projectId === activeProject.id)
      : dailyRecords;

    const projectTasks = activeProject
      ? tasks.filter((t) => t.projectId === activeProject.id)
      : tasks;

    const projectGoals = activeProject
      ? goals.filter((g) => g.projectId === activeProject.id)
      : goals;

    // Metrics calculation
    const totalActualMins = projectDaily.reduce((acc, d) => acc + (parseInt(d.actualMinutes, 10) || 0), 0);
    const totalPlannedMins = projectDaily.reduce((acc, d) => acc + (parseInt(d.plannedMinutes, 10) || 0), 0);
    const avgSessionMins = projectDaily.length > 0 ? Math.round(totalActualMins / projectDaily.length) : 0;

    const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
    const taskCompletionRate = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

    const completedGoals = projectGoals.filter((g) => g.status === 'Completed').length;
    const goalCompletionRate = projectGoals.length > 0 ? Math.round((completedGoals / projectGoals.length) * 100) : 0;

    const streakInfo = StreakService.calculateStreaks(projectDaily);

    // Compute weekly distribution for the last 6 weeks
    const weeklyData = AnalyticsModule.computeWeeklyBuckets(projectDaily);

    container.innerHTML = `
      <div class="analytics-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Analytics & Insights</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects Combined'} • Productivity metrics, consistency, and progress velocity.
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" id="printReportBtn">
            🖨 Print / Export PDF Report
          </button>
        </div>

        <!-- Key Metrics Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Average Session</span>
              <div class="metric-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: var(--primary-400);">⏱</div>
            </div>
            <div class="metric-value">${formatMinutes(avgSessionMins)}</div>
            <div class="metric-subtext">Across ${projectDaily.length} recorded daily sessions</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Planned vs Actual</span>
              <div class="metric-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: var(--success-500);">⚖️</div>
            </div>
            <div class="metric-value">${(totalActualMins / 60).toFixed(1)}<span style="font-size: 1rem; color: var(--text-muted);"> / ${(totalPlannedMins / 60).toFixed(1)} hrs</span></div>
            <div class="metric-subtext">${totalPlannedMins > 0 ? Math.round((totalActualMins / totalPlannedMins) * 100) : 100}% adherence to planned pace</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Task Velocity</span>
              <div class="metric-icon-wrap" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">✓</div>
            </div>
            <div class="metric-value">${taskCompletionRate}%</div>
            <div class="metric-subtext">${completedTasks} of ${projectTasks.length} tasks completed</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Active Days</span>
              <div class="metric-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: var(--warning-500);">📅</div>
            </div>
            <div class="metric-value">${streakInfo.activeDays}</div>
            <div class="metric-subtext">Current streak: ${streakInfo.currentStreak} • Max: ${streakInfo.longestStreak} days</div>
          </div>
        </div>

        <!-- Visual SVG Chart: Weekly Dedicated Hours -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Weekly Study Hours (Last 6 Weeks)</h3>
              <span class="card-subtitle">Hours dedicated to the journey per week</span>
            </div>
          </div>
          <div style="width: 100%; height: 220px; position: relative;">
            ${AnalyticsModule.renderWeeklyBarChart(weeklyData)}
          </div>
        </div>

        <!-- Two Column: Milestone Completion + Multi-Project Comparison -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          
          <!-- Milestone & Goal Completion -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Milestone & Goal Status</h3>
              <span class="card-subtitle">${projectGoals.length} goals registered</span>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 0.35rem;">
                <span>Overall Goal Completion</span>
                <span>${goalCompletionRate}% (${completedGoals} of ${projectGoals.length})</span>
              </div>
              <div class="progress-track progress-track-lg">
                <div class="progress-bar" style="width: ${goalCompletionRate}%;"></div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              ${projectGoals.map((g) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); font-size: var(--font-size-xs);">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>${g.status === 'Completed' ? '✅' : '🎯'}</span>
                    <strong style="color: var(--text-primary);">${g.title}</strong>
                  </div>
                  <span class="badge ${g.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${g.progress || 0}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Multi-Project Comparison Table -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Project Portfolio Comparison</h3>
              <span class="card-subtitle">${projects.length} projects</span>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-xs); text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted);">
                    <th style="padding: 0.6rem;">Project</th>
                    <th style="padding: 0.6rem;">Logged</th>
                    <th style="padding: 0.6rem;">Target</th>
                    <th style="padding: 0.6rem;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map((p) => {
                    const pDaily = dailyRecords.filter((d) => d.projectId === p.id);
                    const pMins = pDaily.reduce((acc, d) => acc + (parseInt(d.actualMinutes, 10) || 0), 0);
                    return `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.6rem; font-weight: 600; color: var(--text-primary);">${p.name}</td>
                        <td style="padding: 0.6rem;">${(pMins / 60).toFixed(1)}h</td>
                        <td style="padding: 0.6rem;">${p.totalTargetHours || '—'}h</td>
                        <td style="padding: 0.6rem;"><span class="badge badge-neutral">${p.status}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    `;

    container.querySelector('#printReportBtn').addEventListener('click', () => {
      window.print();
    });
  }

  static computeWeeklyBuckets(dailyRecords) {
    // Return last 6 weeks (week 1 to week 6)
    const weeks = [];
    const now = new Date();

    for (let w = 5; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - (w * 7));
      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      let minutes = 0;
      dailyRecords.forEach((r) => {
        if (r.date >= startStr && r.date <= endStr) {
          minutes += (parseInt(r.actualMinutes, 10) || 0);
        }
      });

      const label = `Wk -${w}`;
      weeks.push({
        label: w === 0 ? 'This Wk' : label,
        hours: parseFloat((minutes / 60).toFixed(1)),
        minutes
      });
    }

    return weeks;
  }

  static renderWeeklyBarChart(weeks) {
    const maxHours = Math.max(8, ...weeks.map((w) => w.hours));
    const chartHeight = 160;
    const chartWidth = 560;

    const barWidth = 44;
    const spacing = 48;
    const startX = 35;

    const bars = weeks.map((w, index) => {
      const barH = Math.max(4, (w.hours / maxHours) * chartHeight);
      const x = startX + index * (barWidth + spacing);
      const y = chartHeight - barH + 20;

      return `
        <g>
          <!-- Bar -->
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="6" fill="url(#barGrad)" />
          
          <!-- Value on top -->
          <text x="${x + barWidth / 2}" y="${y - 6}" fill="var(--text-secondary)" font-size="11" font-weight="600" text-anchor="middle">
            ${w.hours}h
          </text>

          <!-- Label below -->
          <text x="${x + barWidth / 2}" y="${chartHeight + 36}" fill="var(--text-muted)" font-size="11" text-anchor="middle">
            ${w.label}
          </text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${chartWidth} 220" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#6366f1" />
          </linearGradient>
        </defs>

        <!-- Background grid lines -->
        <line x1="20" y1="20" x2="${chartWidth}" y2="20" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <line x1="20" y1="${chartHeight / 2 + 20}" x2="${chartWidth}" y2="${chartHeight / 2 + 20}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <line x1="20" y1="${chartHeight + 20}" x2="${chartWidth}" y2="${chartHeight + 20}" stroke="var(--border-medium)" />

        ${bars}
      </svg>
    `;
  }
}
