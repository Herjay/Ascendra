/**
 * Data Journey - Goals & Milestones Module
 * Section 5.5 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

export class GoalsModule {
  static async render(container, activeProject) {
    const allGoals = await Database.getAll(STORES.GOALS);
    const goals = activeProject
      ? allGoals.filter((g) => g.projectId === activeProject.id)
      : allGoals;

    container.innerHTML = `
      <div class="goals-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Goals & Milestones</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects'} • ${goals.filter((g) => g.status === 'Completed').length} / ${goals.length} Achieved
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="newGoalBtn">
            + Add Milestone Goal
          </button>
        </div>

        ${goals.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
            ${goals.map((g) => {
              const progress = parseInt(g.progress, 10) || 0;
              const isCompleted = g.status === 'Completed' || progress >= 100;
              return `
                <div class="card card-hover" style="${isCompleted ? 'border-color: var(--success-500);' : ''}">
                  <div class="card-header" style="margin-bottom: 0.6rem;">
                    <div>
                      <span class="badge ${isCompleted ? 'badge-success' : 'badge-primary'}">${g.status || 'In Progress'}</span>
                      <h3 class="card-title" style="font-size: 1.05rem; margin-top: 0.25rem;">${g.title}</h3>
                    </div>
                    <span class="badge ${g.priority === 'High' ? 'badge-danger' : 'badge-neutral'}">${g.priority || 'Medium'}</span>
                  </div>

                  <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">
                    ${g.description || 'No description.'}
                  </p>

                  <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 0.35rem;">
                      <span>Milestone Progress</span>
                      <span>${progress}%</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-bar ${progress >= 100 ? 'progress-bar-success' : ''}" style="width: ${progress}%;"></div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                    <span>Target: <strong>${formatHumanDate(g.targetDate)}</strong></span>
                    <div style="display: flex; gap: 0.3rem;">
                      <button class="btn btn-ghost btn-sm edit-goal-btn" data-id="${g.id}">Edit</button>
                      <button class="btn btn-ghost btn-sm delete-goal-btn" data-id="${g.id}">✕</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <h3 class="empty-state-title">No goals defined yet</h3>
            <p class="empty-state-desc">Set major learning milestones or project deliverables to steer your progress.</p>
            <button class="btn btn-primary btn-sm" id="emptyNewGoalBtn">+ Set Goal</button>
          </div>
        `}
      </div>
    `;

    const addBtn = container.querySelector('#newGoalBtn') || container.querySelector('#emptyNewGoalBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => GoalsModule.openGoalModal(activeProject));
    }

    container.querySelectorAll('.edit-goal-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const goal = await Database.get(STORES.GOALS, id);
        if (goal) GoalsModule.openGoalModal(activeProject, goal);
      });
    });

    container.querySelectorAll('.delete-goal-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm('Delete Goal', 'Delete this goal milestone?', async () => {
          await Database.delete(STORES.GOALS, id);
          showToast('Goal removed', 'info');
          GoalsModule.render(container, activeProject);
        }, 'Delete', true);
      });
    });
  }

  static openGoalModal(activeProject, goal = null) {
    let modal = document.getElementById('goalModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'goalModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title" id="goalModalTitle">New Goal</h3>
            <button class="btn btn-ghost btn-sm" id="closeGoalModalBtn">✕</button>
          </div>
          <form id="goalForm">
            <div class="modal-body">
              <input type="hidden" id="goalId" />

              <div class="form-group">
                <label class="form-label">Goal Title *</label>
                <input class="form-input" id="goalTitle" required placeholder="e.g. Complete Capstone Portfolio Project" />
              </div>

              <div class="form-group">
                <label class="form-label">Description / Scope</label>
                <textarea class="form-textarea" id="goalDescription" placeholder="What does achieving this goal look like?"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Target Date</label>
                  <input type="date" class="form-input" id="goalTargetDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select class="form-select" id="goalPriority">
                    <option value="High">High</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Progress (%): <span id="goalProgressVal">0%</span></label>
                  <input type="range" class="form-input" id="goalProgress" min="0" max="100" value="0" style="accent-color: var(--primary-500);" />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="goalStatus">
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelGoalModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Goal</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeGoalModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelGoalModalBtn').addEventListener('click', closeModal);

      const slider = modal.querySelector('#goalProgress');
      const valLabel = modal.querySelector('#goalProgressVal');
      slider.addEventListener('input', () => {
        valLabel.textContent = `${slider.value}%`;
        if (slider.value === '100') {
          modal.querySelector('#goalStatus').value = 'Completed';
        }
      });

      modal.querySelector('#goalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modal.querySelector('#goalId').value || generateUUID();
        const isNew = !modal.querySelector('#goalId').value;

        const record = {
          id,
          projectId: activeProject ? activeProject.id : '',
          title: modal.querySelector('#goalTitle').value.trim(),
          description: modal.querySelector('#goalDescription').value.trim(),
          targetDate: modal.querySelector('#goalTargetDate').value || '',
          priority: modal.querySelector('#goalPriority').value,
          progress: parseInt(modal.querySelector('#goalProgress').value, 10) || 0,
          status: modal.querySelector('#goalStatus').value,
          updatedAt: new Date().toISOString()
        };

        if (isNew) {
          record.createdAt = new Date().toISOString();
        }

        await Database.put(STORES.GOALS, record);
        closeModal();
        showToast(isNew ? 'Goal created!' : 'Goal updated!', 'success');
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#goalForm');
    form.reset();

    if (goal) {
      modal.querySelector('#goalModalTitle').textContent = 'Edit Goal';
      modal.querySelector('#goalId').value = goal.id;
      modal.querySelector('#goalTitle').value = goal.title || '';
      modal.querySelector('#goalDescription').value = goal.description || '';
      modal.querySelector('#goalTargetDate').value = goal.targetDate || '';
      modal.querySelector('#goalPriority').value = goal.priority || 'Medium';
      modal.querySelector('#goalProgress').value = goal.progress || 0;
      modal.querySelector('#goalProgressVal').textContent = `${goal.progress || 0}%`;
      modal.querySelector('#goalStatus').value = goal.status || 'In Progress';
    } else {
      modal.querySelector('#goalModalTitle').textContent = 'New Goal';
      modal.querySelector('#goalId').value = '';
      modal.querySelector('#goalProgress').value = 0;
      modal.querySelector('#goalProgressVal').textContent = '0%';
    }

    openModal('goalModal');
  }
}
