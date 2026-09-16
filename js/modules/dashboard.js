/**
 * Data Journey - Dashboard Module
 * Section 5.1 & 12 of Specification
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { HealthService } from '../services/healthService.js';
import { StreakService } from '../services/streakService.js';
import { DemoService } from '../services/demoService.js';
import { formatMinutes, formatHumanDate, getTodayDateString } from '../utils/dateUtils.js';
import { openModal, showConfirm, showToast } from '../utils/dom.js';
import { DailyModule } from './daily.js';

export class DashboardModule {
  static async render(container, activeProject, onSelectProject) {
    // 1. Fetch all data needed for dashboard
    const projects = await Database.getAll(STORES.PROJECTS);
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    const tasks = await Database.getAll(STORES.TASKS);
    const breakthroughs = await Database.getAll(STORES.BREAKTHROUGHS);
    const issues = await Database.getAll(STORES.ISSUES);

    const activeProjects = projects.filter((p) => p.status !== 'Archived' && p.status !== 'Completed');

    // Filter for current project if selected
    const projectDaily = activeProject
      ? dailyRecords.filter((d) => d.projectId === activeProject.id)
      : dailyRecords;

    const projectTasks = activeProject
      ? tasks.filter((t) => t.projectId === activeProject.id)
      : tasks;

    // 2. Compute aggregate metrics
    const totalMinutesLogged = projectDaily.reduce((acc, d) => acc + (parseInt(d.actualMinutes, 10) || 0), 0);
    const completedTasksCount = projectTasks.filter((t) => t.status === 'Completed').length;
    const streakInfo = StreakService.calculateStreaks(projectDaily);

    // Health calculation for current project
    const health = activeProject
      ? HealthService.calculateHealth(activeProject, totalMinutesLogged)
      : { status: 'On Track', badgeClass: 'badge-neutral', label: 'Active', explanation: '' };

    // Progress percentage
    let progressPercent = 0;
    let targetHoursDisplay = '';
    if (activeProject && (activeProject.totalTargetHours || activeProject.courseDurationHours)) {
      const targetHours = parseFloat(activeProject.totalTargetHours || activeProject.courseDurationHours);
      const actualHours = totalMinutesLogged / 60;
      progressPercent = Math.min(100, Math.round((actualHours / targetHours) * 100));
      targetHoursDisplay = `${actualHours.toFixed(1)} / ${targetHours.toFixed(1)} hrs`;
    } else if (projectTasks.length > 0) {
      progressPercent = Math.round((completedTasksCount / projectTasks.length) * 100);
      targetHoursDisplay = `${completedTasksCount} / ${projectTasks.length} tasks`;
    }

    // Check today's progress entry
    const todayStr = getTodayDateString();
    const todayRecord = projectDaily.find((d) => d.date === todayStr);

    // Build Recent Activity items
    const recentActivity = [
      ...projectDaily.map((d) => ({
        type: 'Daily Record',
        date: d.date,
        title: `Day ${d.dayNumber}: ${d.sectionWorkedOn || 'Daily Progress'}`,
        desc: d.whatILearned ? `Learned: ${d.whatILearned.slice(0, 80)}...` : `${d.actualMinutes || 0}m logged`,
        badge: `${d.actualMinutes || 0}m`,
        badgeClass: 'badge-primary'
      })),
      ...projectTasks.map((t) => ({
        type: 'Task',
        date: t.updatedAt || t.createdAt,
        title: t.title,
        desc: `Status: ${t.status} • Priority: ${t.priority}`,
        badge: t.status,
        badgeClass: t.status === 'Completed' ? 'badge-success' : 'badge-neutral'
      })),
      ...breakthroughs.filter((b) => !activeProject || b.projectId === activeProject.id).map((b) => ({
        type: 'Breakthrough',
        date: b.date,
        title: `💡 Breakthrough: ${b.title}`,
        desc: b.description ? b.description.slice(0, 90) : '',
        badge: b.category || 'Win',
        badgeClass: 'badge-success'
      }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);

    // Render HTML
    container.innerHTML = `
      <div class="dashboard-view">
        ${activeProject && (activeProject.isDemo || activeProject.id === DemoService.DEMO_PROJECT_ID) ? `
          <div class="demo-notice-banner" style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-lg); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-size: 1.25rem;">💡</span>
              <div>
                <strong style="color: var(--text-primary); font-size: var(--font-size-sm);">Sample / Demo Project:</strong>
                <span style="color: var(--text-secondary); font-size: var(--font-size-xs);">You are viewing the sample project <strong>35-Day Data Analyst Journey</strong>. Feel free to explore or remove it anytime to start with a clean workspace.</span>
              </div>
            </div>
            <button class="btn btn-outline-danger btn-sm" id="dashboardRemoveDemoBtn" style="white-space: nowrap;">
              🗑️ Remove Demo Data
            </button>
          </div>
        ` : ''}

        <!-- Top Banner / Quick Action Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">
              Welcome back to your Journey
            </h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button class="btn btn-secondary btn-sm" id="dashStartTimerBtn">
              ⏱ Session Timer
            </button>
            <button class="btn btn-primary btn-sm" id="dashRecordProgressBtn">
              + Record Daily Progress
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Active Projects</span>
              <div class="metric-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: var(--primary-400);">📁</div>
            </div>
            <div class="metric-value">${activeProjects.length}</div>
            <div class="metric-subtext">${projects.length} total projects registered</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Hours Logged</span>
              <div class="metric-icon-wrap" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">⏱</div>
            </div>
            <div class="metric-value">${(totalMinutesLogged / 60).toFixed(1)}<span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);"> hrs</span></div>
            <div class="metric-subtext">${formatMinutes(totalMinutesLogged)} total dedicated study</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Current Streak</span>
              <div class="metric-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: var(--warning-500);">🔥</div>
            </div>
            <div class="metric-value">${streakInfo.currentStreak}<span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);"> days</span></div>
            <div class="metric-subtext">Best streak: <strong>${streakInfo.longestStreak} days</strong></div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Tasks Completed</span>
              <div class="metric-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: var(--success-500);">✓</div>
            </div>
            <div class="metric-value">${completedTasksCount}<span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);"> / ${projectTasks.length}</span></div>
            <div class="metric-subtext">${projectTasks.length > 0 ? Math.round((completedTasksCount / projectTasks.length) * 100) : 0}% completion velocity</div>
          </div>
        </div>

        <!-- Middle Row: Current Project Card & Today's Focus -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
          
          <!-- Current Project Card -->
          <div class="card card-glass">
            <div class="card-header">
              <div>
                <span class="badge ${health.badgeClass}" style="margin-bottom: 0.4rem;">${health.label}</span>
                <h3 class="card-title">${activeProject ? activeProject.name : 'No Active Project Selected'}</h3>
                <span class="card-subtitle">${activeProject ? activeProject.type : 'Select or create a project to track'}</span>
              </div>
              <a href="#projects" class="btn btn-ghost btn-sm">Switch Project →</a>
            </div>
            
            ${activeProject ? `
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 0.4rem;">
                  <span>Progress Target</span>
                  <span>${progressPercent}% (${targetHoursDisplay})</span>
                </div>
                <div class="progress-track progress-track-lg">
                  <div class="progress-bar ${progressPercent >= 100 ? 'progress-bar-success' : ''}" style="width: ${progressPercent}%;"></div>
                </div>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.4;">
                ${health.explanation}
              </p>
            ` : `
              <div class="empty-state" style="padding: 1.5rem 0;">
                <p class="empty-state-desc">Create your first project or load the 35-Day Data Analyst Journey demo!</p>
                <a href="#projects" class="btn btn-primary btn-sm">Create Project</a>
              </div>
            `}
          </div>

          <!-- Today's Focus -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Today's Focus</h3>
                <span class="card-subtitle">${formatHumanDate(todayStr)}</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="dashLogTodayBtn">
                ${todayRecord ? 'Edit Today\'s Entry' : '+ Log Today'}
              </button>
            </div>

            ${todayRecord ? `
              <div style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <strong style="font-size: var(--font-size-sm); color: var(--text-primary);">Day ${todayRecord.dayNumber}: ${todayRecord.sectionWorkedOn || 'Progress Logged'}</strong>
                  <span class="badge badge-success">${todayRecord.actualMinutes || 0} mins</span>
                </div>
                ${todayRecord.whatILearned ? `<p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 0.25rem;"><strong>Learned:</strong> ${todayRecord.whatILearned}</p>` : ''}
                ${todayRecord.breakthrough ? `<p style="font-size: var(--font-size-xs); color: var(--accent-cyan);"><strong>💡 Win:</strong> ${todayRecord.breakthrough}</p>` : ''}
              </div>
            ` : `
              <div style="background: rgba(99, 102, 241, 0.08); border: 1px dashed var(--border-medium); border-radius: var(--radius-md); padding: 1rem; text-align: center; margin-bottom: 0.75rem;">
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.5rem;">
                  No progress entry recorded yet for today. Keep your streak alive!
                </p>
                <button class="btn btn-primary btn-sm" id="dashQuickLogBtn">Quick Record (1 Hour)</button>
              </div>
            `}

            <!-- Daily Target Checklist -->
            <div style="font-size: var(--font-size-xs); color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Daily Target: ${activeProject ? activeProject.dailyTargetHours || 1 : 1} hour(s)</span>
              <span>Logged: ${todayRecord ? `${((todayRecord.actualMinutes || 0) / 60).toFixed(1)} hrs` : '0.0 hrs'}</span>
            </div>
          </div>
        </div>

        <!-- Activity Heatmap Matrix (GitHub Style Consistency Grid) -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Consistency Heatmap</h3>
              <span class="card-subtitle">Daily activity intensity over the journey</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: var(--font-size-xs); color: var(--text-muted);">
              <span>Less</span>
              <span class="heatmap-cell level-0" style="display: inline-block;"></span>
              <span class="heatmap-cell level-1" style="display: inline-block;"></span>
              <span class="heatmap-cell level-2" style="display: inline-block;"></span>
              <span class="heatmap-cell level-3" style="display: inline-block;"></span>
              <span class="heatmap-cell level-4" style="display: inline-block;"></span>
              <span>More</span>
            </div>
          </div>

          <div class="heatmap-container">
            <div class="heatmap-grid" id="dashboardHeatmapGrid">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed & Breakthroughs -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recent Activity Feed</h3>
            <span class="card-subtitle">Chronological milestones, tasks, and reflections</span>
          </div>

          ${recentActivity.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${recentActivity.map((act) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border-left: 3px solid var(--primary-500);">
                  <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <strong style="font-size: var(--font-size-sm); color: var(--text-primary);">${act.title}</strong>
                      <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatHumanDate(act.date)}</span>
                    </div>
                    <span style="font-size: var(--font-size-xs); color: var(--text-secondary);">${act.desc}</span>
                  </div>
                  <span class="badge ${act.badgeClass}">${act.badge}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">📋</div>
              <p class="empty-state-title">No recent activity</p>
              <p class="empty-state-desc">Start by recording your daily progress or adding tasks to populate your timeline.</p>
            </div>
          `}
        </div>
      </div>
    `;

    // 3. Render 35-day / 12-week Heatmap cells
    this.renderHeatmap(streakInfo.dateMap);

    // 4. Wire up event listeners
    const recordBtn = container.querySelector('#dashRecordProgressBtn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        if (!activeProject) {
          showToast('Please create or select a project first!', 'info');
          window.location.hash = '#projects';
        } else {
          DailyModule.openDailyModal(activeProject);
        }
      });
    }

    const logTodayBtn = container.querySelector('#dashLogTodayBtn');
    if (logTodayBtn) {
      logTodayBtn.addEventListener('click', () => {
        if (!activeProject) {
          showToast('Please create or select a project first!', 'info');
          window.location.hash = '#projects';
        } else {
          DailyModule.openDailyModal(activeProject, todayRecord, projectDaily.length + 1);
        }
      });
    }

    const quickLogBtn = container.querySelector('#dashQuickLogBtn');
    if (quickLogBtn) {
      quickLogBtn.addEventListener('click', async () => {
        if (!activeProject) {
          showToast('Please create or select a project first!', 'info');
          window.location.hash = '#projects';
          return;
        }
        const record = {
          id: todayRecord ? todayRecord.id : undefined,
          projectId: activeProject.id,
          date: todayStr,
          dayNumber: (projectDaily.length + 1),
          actualMinutes: 60,
          plannedMinutes: 60,
          sectionWorkedOn: 'Daily Learning Session',
          status: 'Completed',
          whatILearned: 'Completed 1 hour of focused learning session.'
        };
        DailyModule.openDailyModal(activeProject, record, projectDaily.length + 1);
      });
    }

    const timerBtn = container.querySelector('#dashStartTimerBtn');
    if (timerBtn) {
      timerBtn.addEventListener('click', () => {
        window.location.hash = '#timetracker';
      });
    }

    const removeDemoBtn = container.querySelector('#dashboardRemoveDemoBtn');
    if (removeDemoBtn) {
      removeDemoBtn.addEventListener('click', () => {
        showConfirm({
          title: 'Remove Demo Data?',
          message: 'This will remove the demo project and all of its sample records. Your own projects and data will not be affected.',
          confirmText: 'Remove Demo Data',
          confirmClass: 'btn-danger',
          onConfirm: async () => {
            await DemoService.removeDemoData();
            showToast('Demo project and sample records removed.', 'info');
            if (typeof onSelectProject === 'function') {
              const remaining = await Database.getAll(STORES.PROJECTS);
              onSelectProject(remaining.length > 0 ? remaining[0] : null);
            }
          }
        });
      });
    }
  }

  static renderHeatmap(dateMinutesMap = {}) {
    const grid = document.getElementById('dashboardHeatmapGrid');
    if (!grid) return;

    // Generate last 70 days (10 weeks) of cells
    const daysToShow = 70;
    const cells = [];
    const today = new Date();

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = dateMinutesMap[dateStr] || 0;

      let level = 'level-0';
      if (minutes >= 90) level = 'level-4';
      else if (minutes >= 60) level = 'level-3';
      else if (minutes >= 30) level = 'level-2';
      else if (minutes > 0) level = 'level-1';

      cells.push(`
        <div class="heatmap-cell ${level}" 
             title="${dateStr}: ${minutes > 0 ? `${minutes} minutes logged` : 'No study logged'}"
             data-date="${dateStr}">
        </div>
      `);
    }

    grid.innerHTML = cells.join('');
  }
}
