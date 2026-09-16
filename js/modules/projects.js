/**
 * Data Journey - Projects Management Module
 * Section 5.2 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { HealthService } from '../services/healthService.js';
import { DemoService } from '../services/demoService.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate, formatMinutes } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

export class ProjectsModule {
  static async render(container, activeProject, onSelectProject) {
    const projects = await Database.getAll(STORES.PROJECTS);
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    const tasks = await Database.getAll(STORES.TASKS);

    container.innerHTML = `
      <div class="projects-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Projects</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              Manage multi-project learning, coding, and productivity journeys.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="newProjectBtn">
            + New Project
          </button>
        </div>

        ${projects.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
            ${projects.map((proj) => {
              const projDaily = dailyRecords.filter((d) => d.projectId === proj.id);
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const totalMins = projDaily.reduce((acc, d) => acc + (parseInt(d.actualMinutes, 10) || 0), 0);
              const completedTasks = projTasks.filter((t) => t.status === 'Completed').length;
              const health = HealthService.calculateHealth(proj, totalMins);

              let progressPct = 0;
              const targetHours = parseFloat(proj.totalTargetHours || proj.courseDurationHours || 0);
              if (targetHours > 0) {
                progressPct = Math.min(100, Math.round(((totalMins / 60) / targetHours) * 100));
              } else if (projTasks.length > 0) {
                progressPct = Math.round((completedTasks / projTasks.length) * 100);
              }

              const isActive = activeProject && activeProject.id === proj.id;
              const isDemo = DemoService.isDemo(proj);

              return `
                <div class="card card-hover ${isActive ? 'card-glass' : ''}" style="${isActive ? 'border-color: var(--primary-500); box-shadow: var(--shadow-glow);' : ''}">
                  <div class="card-header" style="margin-bottom: 0.75rem;">
                    <div>
                      <span class="badge ${health.badgeClass}" style="margin-bottom: 0.35rem;">${health.label}</span>
                      ${isDemo ? `<span class="badge badge-warning" style="margin-bottom: 0.35rem; margin-left: 0.35rem;">Sample Demo</span>` : ''}
                      <h3 class="card-title" style="font-size: var(--font-size-lg);">${proj.name}</h3>
                      <span class="card-subtitle">${proj.type} • Priority: ${proj.priority || 'Normal'}</span>
                    </div>
                    ${isActive ? `<span class="badge badge-primary">Active</span>` : `
                      <button class="btn btn-ghost btn-sm select-project-btn" data-id="${proj.id}">Select</button>
                    `}
                  </div>

                  <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${proj.description || 'No description provided.'}
                  </p>

                  <!-- Progress Bar -->
                  <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 0.35rem;">
                      <span>Progress</span>
                      <span>${progressPct}% (${(totalMins / 60).toFixed(1)} / ${targetHours > 0 ? targetHours.toFixed(1) : '—'} hrs)</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-bar ${progressPct >= 100 ? 'progress-bar-success' : ''}" style="width: ${progressPct}%;"></div>
                    </div>
                  </div>

                  <!-- Details Grid -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 1.25rem; background: var(--bg-surface-elevated); padding: 0.65rem; border-radius: var(--radius-md);">
                    <div>Days Target: <strong>${proj.plannedDurationDays || '—'} days</strong></div>
                    <div>Daily Goal: <strong>${proj.dailyTargetHours || 1} hr/day</strong></div>
                    <div>Started: <strong>${formatHumanDate(proj.startDate)}</strong></div>
                    <div>Target Date: <strong>${formatHumanDate(proj.targetDate)}</strong></div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                    <div style="display: flex; gap: 0.4rem;">
                      <button class="btn btn-secondary btn-sm edit-proj-btn" data-id="${proj.id}">Edit</button>
                      ${isDemo ? `
                        <button class="btn btn-danger btn-sm remove-demo-btn" data-id="${proj.id}">Remove Demo Data</button>
                      ` : `
                        <button class="btn btn-danger btn-sm delete-proj-btn" data-id="${proj.id}">Delete</button>
                      `}
                    </div>
                    <button class="btn btn-ghost btn-sm set-active-btn" data-id="${proj.id}">
                      ${isActive ? 'Selected' : 'Set as Active'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📁</div>
            <h3 class="empty-state-title">No projects yet</h3>
            <p class="empty-state-desc">Create your first learning journey or project to begin tracking daily progress!</p>
            <button class="btn btn-primary btn-sm" id="emptyNewProjectBtn">+ Create Project</button>
          </div>
        `}
      </div>
    `;

    // Bind action events
    const newBtn = container.querySelector('#newProjectBtn') || container.querySelector('#emptyNewProjectBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        ProjectsModule.openProjectModal();
      });
    }

    container.querySelectorAll('.set-active-btn, .select-project-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const proj = await Database.get(STORES.PROJECTS, id);
        if (proj) {
          await Database.put(STORES.SETTINGS, { key: 'activeProjectId', value: id });
          showToast(`Active project changed to "${proj.name}"`, 'info');
          if (onSelectProject) onSelectProject(proj);
        }
      });
    });

    container.querySelectorAll('.edit-proj-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const proj = await Database.get(STORES.PROJECTS, id);
        if (proj) {
          ProjectsModule.openProjectModal(proj);
        }
      });
    });

    container.querySelectorAll('.delete-proj-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const proj = await Database.get(STORES.PROJECTS, id);
        if (proj) {
          showConfirm(
            'Delete Project',
            `Are you sure you want to permanently delete "${proj.name}"? This action cannot be undone.`,
            async () => {
              await Database.delete(STORES.PROJECTS, id);
              showToast(`Project "${proj.name}" deleted`, 'info');
              // If active project was deleted, clear active setting
              if (activeProject && activeProject.id === id) {
                await Database.delete(STORES.SETTINGS, 'activeProjectId');
                if (onSelectProject) onSelectProject(null);
              } else {
                ProjectsModule.render(container, activeProject, onSelectProject);
              }
            },
            'Delete Project',
            true
          );
        }
      });
    });

    container.querySelectorAll('.remove-demo-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        showConfirm({
          title: 'Remove Demo Data?',
          message: 'This will remove the demo project and all of its sample records. Your own projects and data will not be affected.',
          confirmText: 'Remove Demo Data',
          confirmClass: 'btn-danger',
          onConfirm: async () => {
            await DemoService.removeDemoData();
            showToast('Demo project and records removed successfully.', 'info');
            const remaining = await Database.getAll(STORES.PROJECTS);
            const nextProj = remaining.length > 0 ? remaining[0] : null;
            if (onSelectProject) onSelectProject(nextProj);
            ProjectsModule.render(container, nextProj, onSelectProject);
          }
        });
      });
    });
  }

  static openProjectModal(project = null) {
    let modal = document.getElementById('projectModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'projectModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title" id="projModalTitle">New Project</h3>
            <button class="btn btn-ghost btn-sm" id="closeProjModalBtn">✕</button>
          </div>
          <form id="projectForm">
            <div class="modal-body">
              <input type="hidden" id="projId" />
              
              <div class="form-group">
                <label class="form-label">Project Name *</label>
                <input class="form-input" id="projName" required placeholder="e.g. 35-Day Data Analyst Journey" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Project Type</label>
                  <select class="form-select" id="projType">
                    <option value="Learning">Learning / Course</option>
                    <option value="Software">Software Development</option>
                    <option value="Portfolio">Portfolio Project</option>
                    <option value="Research">Research / Writing</option>
                    <option value="Business">Business / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select class="form-select" id="projPriority">
                    <option value="High">High</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description / Scope</label>
                <textarea class="form-textarea" id="projDescription" placeholder="Outline the curriculum, goals, and targets..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Planned Days</label>
                  <input type="number" class="form-input" id="projPlannedDays" min="1" value="35" />
                  <span class="form-hint">e.g. 35 days</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Daily Target (Hours)</label>
                  <input type="number" step="0.25" class="form-input" id="projDailyHours" min="0.25" value="1" />
                  <span class="form-hint">e.g. 1 hour / day</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Total Target (Hours)</label>
                  <input type="number" step="0.5" class="form-input" id="projTotalHours" min="1" value="35" />
                  <span class="form-hint">e.g. 35 hours total</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-input" id="projStartDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Target Completion Date</label>
                  <input type="date" class="form-input" id="projTargetDate" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelProjModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Project</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeProjModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelProjModalBtn').addEventListener('click', closeModal);

      // Auto-calculate total hours when days or daily hours change
      const updateCalculatedHours = () => {
        const days = parseFloat(modal.querySelector('#projPlannedDays').value) || 0;
        const daily = parseFloat(modal.querySelector('#projDailyHours').value) || 0;
        if (days && daily) {
          modal.querySelector('#projTotalHours').value = (days * daily).toFixed(1);
        }
      };

      modal.querySelector('#projPlannedDays').addEventListener('input', updateCalculatedHours);
      modal.querySelector('#projDailyHours').addEventListener('input', updateCalculatedHours);

      // Save handler
      modal.querySelector('#projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modal.querySelector('#projId').value || generateUUID();
        const isNew = !modal.querySelector('#projId').value;

        const record = {
          id,
          name: modal.querySelector('#projName').value.trim(),
          type: modal.querySelector('#projType').value,
          priority: modal.querySelector('#projPriority').value,
          description: modal.querySelector('#projDescription').value.trim(),
          plannedDurationDays: parseInt(modal.querySelector('#projPlannedDays').value, 10) || 35,
          dailyTargetHours: parseFloat(modal.querySelector('#projDailyHours').value) || 1,
          totalTargetHours: parseFloat(modal.querySelector('#projTotalHours').value) || 35,
          startDate: modal.querySelector('#projStartDate').value || new Date().toISOString().split('T')[0],
          targetDate: modal.querySelector('#projTargetDate').value || '',
          status: 'In Progress',
          updatedAt: new Date().toISOString()
        };

        if (isNew) {
          record.createdAt = new Date().toISOString();
        }

        await Database.put(STORES.PROJECTS, record);

        // Auto-set as active project if first or user just created it
        const currentActive = await Database.get(STORES.SETTINGS, 'activeProjectId');
        if (!currentActive) {
          await Database.put(STORES.SETTINGS, { key: 'activeProjectId', value: id });
        }

        closeModal();
        showToast(isNew ? 'Project created successfully!' : 'Project updated!', 'success');

        // Re-render
        window.location.hash = '#projects';
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    // Populate form
    const form = modal.querySelector('#projectForm');
    form.reset();

    if (project) {
      modal.querySelector('#projModalTitle').textContent = 'Edit Project';
      modal.querySelector('#projId').value = project.id;
      modal.querySelector('#projName').value = project.name || '';
      modal.querySelector('#projType').value = project.type || 'Learning';
      modal.querySelector('#projPriority').value = project.priority || 'Medium';
      modal.querySelector('#projDescription').value = project.description || '';
      modal.querySelector('#projPlannedDays').value = project.plannedDurationDays || 35;
      modal.querySelector('#projDailyHours').value = project.dailyTargetHours || 1;
      modal.querySelector('#projTotalHours').value = project.totalTargetHours || 35;
      modal.querySelector('#projStartDate').value = project.startDate || '';
      modal.querySelector('#projTargetDate').value = project.targetDate || '';
    } else {
      modal.querySelector('#projModalTitle').textContent = 'New Project';
      modal.querySelector('#projId').value = '';
      modal.querySelector('#projStartDate').value = new Date().toISOString().split('T')[0];
      const future = new Date();
      future.setDate(future.getDate() + 35);
      modal.querySelector('#projTargetDate').value = future.toISOString().split('T')[0];
    }

    openModal('projectModal');
  }
}
