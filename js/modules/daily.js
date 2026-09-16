/**
 * Data Journey - Daily Progress Tracker Module
 * Section 5.3 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate, formatMinutes, getTodayDateString, hoursToMinutes } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

export class DailyModule {
  static async render(container, activeProject) {
    if (!activeProject) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📁</div>
          <h3 class="empty-state-title">No Active Project Selected</h3>
          <p class="empty-state-desc">Select or create a project to start logging daily progress.</p>
          <a href="#projects" class="btn btn-primary btn-sm">Go to Projects</a>
        </div>
      `;
      return;
    }

    const allDaily = await Database.getAll(STORES.DAILY_PROGRESS);
    const records = allDaily
      .filter((d) => d.projectId === activeProject.id)
      .sort((a, b) => (b.dayNumber || 0) - (a.dayNumber || 0));

    const totalDaysPlanned = activeProject.plannedDurationDays || 35;
    const totalMinsLogged = records.reduce((acc, r) => acc + (parseInt(r.actualMinutes, 10) || 0), 0);

    container.innerHTML = `
      <div class="daily-progress-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Daily Progress</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject.name} • ${records.length} of ${totalDaysPlanned} Days Logged • ${formatMinutes(totalMinsLogged)} Total
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="newDailyRecordBtn">
            + Record Day's Progress
          </button>
        </div>

        ${records.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${records.map((rec) => `
              <div class="card card-hover" style="border-left: 4px solid var(--primary-500);">
                <div class="card-header" style="margin-bottom: 0.6rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="badge badge-primary" style="font-size: var(--font-size-sm); font-weight: 700; padding: 0.3rem 0.75rem;">
                      Day ${rec.dayNumber}
                    </span>
                    <div>
                      <h3 class="card-title" style="font-size: 1.05rem;">${rec.sectionWorkedOn || 'Daily Reflection'}</h3>
                      <span class="card-subtitle">${formatHumanDate(rec.date)}</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="badge ${rec.actualMinutes >= 60 ? 'badge-success' : 'badge-warning'}">
                      ⏱ ${rec.actualMinutes || 0}m (${((rec.actualMinutes || 0) / 60).toFixed(1)} hrs)
                    </span>
                    <button class="btn btn-ghost btn-sm edit-daily-btn" data-id="${rec.id}">Edit</button>
                    <button class="btn btn-ghost btn-sm delete-daily-btn" data-id="${rec.id}">✕</button>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem; margin-top: 0.5rem; font-size: var(--font-size-sm);">
                  ${rec.dailyGoal ? `
                    <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
                      <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">Daily Goal</span>
                      <span>${rec.dailyGoal}</span>
                    </div>
                  ` : ''}

                  ${rec.whatILearned ? `
                    <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
                      <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">What I Learned</span>
                      <span style="color: var(--text-primary);">${rec.whatILearned}</span>
                    </div>
                  ` : ''}

                  ${rec.breakthrough ? `
                    <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); padding: 0.75rem; border-radius: var(--radius-md);">
                      <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">💡 Breakthrough / Win</span>
                      <span style="color: var(--text-primary);">${rec.breakthrough}</span>
                    </div>
                  ` : ''}

                  ${rec.challenge ? `
                    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); padding: 0.75rem; border-radius: var(--radius-md);">
                      <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--warning-500); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">⚠️ Challenge / Issue</span>
                      <span style="color: var(--text-primary);">${rec.challenge}</span>
                    </div>
                  ` : ''}
                </div>

                ${rec.notes ? `
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 0.75rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.5rem;">
                    <strong>Notes:</strong> ${rec.notes}
                  </p>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3 class="empty-state-title">No daily records logged yet</h3>
            <p class="empty-state-desc">Record your first day's activity, study session time, and reflections.</p>
            <button class="btn btn-primary btn-sm" id="emptyNewDailyBtn">+ Record Day 1</button>
          </div>
        `}
      </div>
    `;

    // Bind event buttons
    const addBtn = container.querySelector('#newDailyRecordBtn') || container.querySelector('#emptyNewDailyBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        DailyModule.openDailyModal(activeProject, null, records.length + 1);
      });
    }

    container.querySelectorAll('.edit-daily-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const rec = await Database.get(STORES.DAILY_PROGRESS, id);
        if (rec) {
          DailyModule.openDailyModal(activeProject, rec);
        }
      });
    });

    container.querySelectorAll('.delete-daily-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm(
          'Delete Daily Record',
          'Are you sure you want to delete this daily record? Logged hours will be removed from project totals.',
          async () => {
            await Database.delete(STORES.DAILY_PROGRESS, id);
            showToast('Daily record deleted', 'info');
            DailyModule.render(container, activeProject);
          },
          'Delete',
          true
        );
      });
    });
  }

  static openDailyModal(activeProject, record = null, defaultDayNumber = null) {
    let modal = document.getElementById('dailyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dailyModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title" id="dailyModalTitle">Record Daily Progress</h3>
            <button class="btn btn-ghost btn-sm" id="closeDailyModalBtn">✕</button>
          </div>
          <form id="dailyForm">
            <div class="modal-body">
              <input type="hidden" id="dailyId" />
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Day Number *</label>
                  <input type="number" class="form-input" id="dailyDayNumber" required min="1" />
                </div>
                <div class="form-group">
                  <label class="form-label">Date *</label>
                  <input type="date" class="form-input" id="dailyDate" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Section / Topic Worked On *</label>
                <input class="form-input" id="dailySection" required placeholder="e.g. Pandas GroupBy, Aggregations & Pivot Tables" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Actual Time Spent (Hours) *</label>
                  <input type="number" step="0.25" class="form-input" id="dailyActualHours" required min="0.1" value="1.0" />
                </div>
                <div class="form-group">
                  <label class="form-label">Planned Time (Hours)</label>
                  <input type="number" step="0.25" class="form-input" id="dailyPlannedHours" value="1.0" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Daily Goal</label>
                <input class="form-input" id="dailyGoalText" placeholder="What did you set out to achieve today?" />
              </div>

              <div class="form-group">
                <label class="form-label">What I Learned (Reflections & Takeaways)</label>
                <textarea class="form-textarea" id="dailyLearned" placeholder="Key concepts, commands, algorithms, or insights understood..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">💡 Breakthrough / Milestone</label>
                <input class="form-input" id="dailyBreakthrough" placeholder="Any 'Aha!' moment, breakthrough, or fast solution?" />
              </div>

              <div class="form-group">
                <label class="form-label">⚠️ Challenge / Problem Encountered</label>
                <input class="form-input" id="dailyChallenge" placeholder="Any blocker, syntax error, bug, or difficult concept?" />
              </div>

              <div class="form-group">
                <label class="form-label">Additional Notes & Resources</label>
                <textarea class="form-textarea" id="dailyNotes" placeholder="Links, docs, commands to review later..." style="min-height: 60px;"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelDailyModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Daily Progress</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeDailyModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelDailyModalBtn').addEventListener('click', closeModal);

      modal.querySelector('#dailyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modal.querySelector('#dailyId').value || generateUUID();
        const isNew = !modal.querySelector('#dailyId').value;

        const actualHours = parseFloat(modal.querySelector('#dailyActualHours').value) || 1;
        const plannedHours = parseFloat(modal.querySelector('#dailyPlannedHours').value) || 1;
        const section = modal.querySelector('#dailySection').value.trim();
        const date = modal.querySelector('#dailyDate').value;
        const breakthroughText = modal.querySelector('#dailyBreakthrough').value.trim();
        const challengeText = modal.querySelector('#dailyChallenge').value.trim();

        const dailyRecord = {
          id,
          projectId: activeProject.id,
          dayNumber: parseInt(modal.querySelector('#dailyDayNumber').value, 10),
          date,
          sectionWorkedOn: section,
          actualMinutes: hoursToMinutes(actualHours),
          plannedMinutes: hoursToMinutes(plannedHours),
          dailyGoal: modal.querySelector('#dailyGoalText').value.trim(),
          whatILearned: modal.querySelector('#dailyLearned').value.trim(),
          breakthrough: breakthroughText,
          challenge: challengeText,
          notes: modal.querySelector('#dailyNotes').value.trim(),
          status: 'Completed',
          updatedAt: new Date().toISOString()
        };

        if (isNew) {
          dailyRecord.createdAt = new Date().toISOString();
        }

        await Database.put(STORES.DAILY_PROGRESS, dailyRecord);

        // If user recorded a breakthrough, automatically add to Breakthroughs store
        if (breakthroughText) {
          const bt = {
            id: generateUUID(),
            projectId: activeProject.id,
            title: breakthroughText,
            description: `Logged during Day ${dailyRecord.dayNumber}: ${section}`,
            date,
            category: 'Daily Milestone',
            importance: 'High',
            createdAt: new Date().toISOString()
          };
          await Database.put(STORES.BREAKTHROUGHS, bt);
        }

        // If user recorded an issue/challenge, automatically log to Issues store
        if (challengeText) {
          const iss = {
            id: generateUUID(),
            projectId: activeProject.id,
            title: challengeText,
            description: `Encountered during Day ${dailyRecord.dayNumber}: ${section}`,
            date,
            severity: 'Medium',
            status: 'Open',
            possibleSolution: '',
            createdAt: new Date().toISOString()
          };
          await Database.put(STORES.ISSUES, iss);
        }

        closeModal();
        showToast(isNew ? 'Day progress recorded!' : 'Daily record updated!', 'success');

        // Refresh current view
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#dailyForm');
    form.reset();

    if (record) {
      modal.querySelector('#dailyModalTitle').textContent = `Edit Day ${record.dayNumber}`;
      modal.querySelector('#dailyId').value = record.id;
      modal.querySelector('#dailyDayNumber').value = record.dayNumber;
      modal.querySelector('#dailyDate').value = record.date;
      modal.querySelector('#dailySection').value = record.sectionWorkedOn || '';
      modal.querySelector('#dailyActualHours').value = (record.actualMinutes / 60).toFixed(2);
      modal.querySelector('#dailyPlannedHours').value = (record.plannedMinutes / 60).toFixed(2);
      modal.querySelector('#dailyGoalText').value = record.dailyGoal || '';
      modal.querySelector('#dailyLearned').value = record.whatILearned || '';
      modal.querySelector('#dailyBreakthrough').value = record.breakthrough || '';
      modal.querySelector('#dailyChallenge').value = record.challenge || '';
      modal.querySelector('#dailyNotes').value = record.notes || '';
    } else {
      modal.querySelector('#dailyModalTitle').textContent = `Record Day ${defaultDayNumber || 1}`;
      modal.querySelector('#dailyId').value = '';
      modal.querySelector('#dailyDayNumber').value = defaultDayNumber || 1;
      modal.querySelector('#dailyDate').value = getTodayDateString();
      modal.querySelector('#dailyActualHours').value = activeProject.dailyTargetHours || 1.0;
      modal.querySelector('#dailyPlannedHours').value = activeProject.dailyTargetHours || 1.0;

      if (!defaultDayNumber && activeProject) {
        Database.getAll(STORES.DAILY_PROGRESS).then((allDaily) => {
          const projRecords = allDaily.filter((d) => d.projectId === activeProject.id);
          const nextDay = projRecords.length + 1;
          const dayInput = modal.querySelector('#dailyDayNumber');
          const titleEl = modal.querySelector('#dailyModalTitle');
          if (dayInput && (!dayInput.value || dayInput.value == '1')) {
            dayInput.value = nextDay;
          }
          if (titleEl && titleEl.textContent === 'Record Day 1') {
            titleEl.textContent = `Record Day ${nextDay}`;
          }
        }).catch(() => {});
      }
    }

    openModal('dailyModal');
  }
}
