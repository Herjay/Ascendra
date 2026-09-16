/**
 * Data Journey - Time Tracking & Interactive Stopwatch Module
 * Section 5.8 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate, formatMinutes, getTodayDateString, hoursToMinutes } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

// Timer state persisted during the active browser session
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

export class TimeTrackerModule {
  static async render(container, activeProject) {
    const allEntries = await Database.getAll(STORES.TIME_ENTRIES);
    const tasks = await Database.getAll(STORES.TASKS);

    const entries = activeProject
      ? allEntries.filter((e) => e.projectId === activeProject.id)
      : allEntries;

    entries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const totalMinutes = entries.reduce((acc, e) => acc + (parseInt(e.durationMinutes, 10) || 0), 0);

    container.innerHTML = `
      <div class="timetracker-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Time Tracking</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects'} • ${formatMinutes(totalMinutes)} Total Logged (${(totalMinutes / 60).toFixed(1)} hrs)
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="manualLogTimeBtn">
            + Manual Time Entry
          </button>
        </div>

        <!-- Live Session Stopwatch Widget -->
        <div class="card card-glass" style="margin-bottom: 1.5rem; border: 1px solid var(--border-medium);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="badge badge-primary" style="margin-bottom: 0.35rem;">Interactive Session Timer</span>
              <h3 class="card-title">Study & Deep Work Stopwatch</h3>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted);">
                Run this during your daily 1-hour session. When finished, log it directly into your project!
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div class="timer-digits" id="liveTimerDisplay">
                ${TimeTrackerModule.formatStopwatchTime(timerSeconds)}
              </div>

              <div style="display: flex; gap: 0.5rem;">
                <button class="btn ${timerRunning ? 'btn-secondary' : 'btn-primary'} btn-sm" id="timerToggleBtn">
                  ${timerRunning ? '❚❚ Pause' : '▶ Start'}
                </button>
                <button class="btn btn-secondary btn-sm" id="timerResetBtn">
                  ↺ Reset
                </button>
                <button class="btn btn-primary btn-sm" id="timerLogSessionBtn" ${timerSeconds < 60 ? 'disabled' : ''}>
                  ✓ Log Session
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Logs History Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recorded Sessions</h3>
            <span class="card-subtitle">${entries.length} total sessions</span>
          </div>

          ${entries.length > 0 ? `
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: var(--font-size-xs); text-transform: uppercase;">
                    <th style="padding: 0.75rem;">Date</th>
                    <th style="padding: 0.75rem;">Duration</th>
                    <th style="padding: 0.75rem;">Category</th>
                    <th style="padding: 0.75rem;">Description / Task</th>
                    <th style="padding: 0.75rem; text-align: right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${entries.map((e) => {
                    const matchedTask = tasks.find((t) => t.id === e.taskId);
                    return `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 0.75rem; font-weight: 500;">${formatHumanDate(e.date)}</td>
                        <td style="padding: 0.75rem;">
                          <span class="badge badge-primary">${formatMinutes(e.durationMinutes)}</span>
                        </td>
                        <td style="padding: 0.75rem;">
                          <span class="badge badge-neutral">${e.category || 'General'}</span>
                        </td>
                        <td style="padding: 0.75rem; color: var(--text-secondary);">
                          ${e.description || (matchedTask ? matchedTask.title : 'Study session')}
                        </td>
                        <td style="padding: 0.75rem; text-align: right;">
                          <button class="btn btn-ghost btn-sm delete-time-btn" data-id="${e.id}">✕</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">⏱</div>
              <h3 class="empty-state-title">No time entries recorded</h3>
              <p class="empty-state-desc">Start the stopwatch above or manually log study durations.</p>
            </div>
          `}
        </div>
      </div>
    `;

    // Wire up stopwatch controls
    const toggleBtn = container.querySelector('#timerToggleBtn');
    const resetBtn = container.querySelector('#timerResetBtn');
    const logBtn = container.querySelector('#timerLogSessionBtn');
    const display = container.querySelector('#liveTimerDisplay');

    toggleBtn.addEventListener('click', () => {
      if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        toggleBtn.textContent = '▶ Resume';
        toggleBtn.className = 'btn btn-primary btn-sm';
      } else {
        timerRunning = true;
        toggleBtn.textContent = '❚❚ Pause';
        toggleBtn.className = 'btn btn-secondary btn-sm';
        timerInterval = setInterval(() => {
          timerSeconds++;
          display.textContent = TimeTrackerModule.formatStopwatchTime(timerSeconds);
          if (timerSeconds >= 60 && logBtn.disabled) {
            logBtn.disabled = false;
          }
        }, 1000);
      }
    });

    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 0;
      display.textContent = '00:00:00';
      toggleBtn.textContent = '▶ Start';
      toggleBtn.className = 'btn btn-primary btn-sm';
      logBtn.disabled = true;
    });

    logBtn.addEventListener('click', () => {
      const minutesSpent = Math.max(1, Math.round(timerSeconds / 60));
      TimeTrackerModule.openTimeEntryModal(activeProject, minutesSpent);
    });

    // Manual time button
    const manualBtn = container.querySelector('#manualLogTimeBtn');
    manualBtn.addEventListener('click', () => {
      TimeTrackerModule.openTimeEntryModal(activeProject);
    });

    // Delete buttons
    container.querySelectorAll('.delete-time-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm('Delete Entry', 'Remove this time entry?', async () => {
          await Database.delete(STORES.TIME_ENTRIES, id);
          showToast('Time entry deleted', 'info');
          TimeTrackerModule.render(container, activeProject);
        }, 'Delete', true);
      });
    });
  }

  static formatStopwatchTime(totalSeconds) {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  static openTimeEntryModal(activeProject, defaultMinutes = 60) {
    let modal = document.getElementById('timeEntryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'timeEntryModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title">Log Time Entry</h3>
            <button class="btn btn-ghost btn-sm" id="closeTimeModalBtn">✕</button>
          </div>
          <form id="timeEntryForm">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Duration (Minutes) *</label>
                  <input type="number" class="form-input" id="timeDurationMins" required min="1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input type="date" class="form-input" id="timeDate" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="timeCategory">
                  <option value="Study Session">Study Session</option>
                  <option value="Coding / Practice">Coding / Practice</option>
                  <option value="Reading / Research">Reading / Research</option>
                  <option value="Debugging / Issues">Debugging / Issues</option>
                  <option value="Portfolio Work">Portfolio Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Session Description</label>
                <input class="form-input" id="timeDescription" placeholder="e.g. Worked through LeetCode SQL aggregations" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelTimeModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Time Entry</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeTimeModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelTimeModalBtn').addEventListener('click', closeModal);

      modal.querySelector('#timeEntryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const duration = parseInt(modal.querySelector('#timeDurationMins').value, 10);
        const record = {
          id: generateUUID(),
          projectId: activeProject ? activeProject.id : '',
          durationMinutes: duration,
          date: modal.querySelector('#timeDate').value,
          category: modal.querySelector('#timeCategory').value,
          description: modal.querySelector('#timeDescription').value.trim(),
          createdAt: new Date().toISOString()
        };

        await Database.put(STORES.TIME_ENTRIES, record);
        closeModal();
        showToast(`Logged ${formatMinutes(duration)}!`, 'success');
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#timeEntryForm');
    form.reset();
    modal.querySelector('#timeDurationMins').value = defaultMinutes;
    modal.querySelector('#timeDate').value = getTodayDateString();
    openModal('timeEntryModal');
  }
}
