/**
 * Data Journey - Tasks Management Module
 * Section 5.4 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate, formatMinutes, hoursToMinutes } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

export class TasksModule {
  static async render(container, activeProject) {
    const allTasks = await Database.getAll(STORES.TASKS);
    const tasks = activeProject
      ? allTasks.filter((t) => t.projectId === activeProject.id)
      : allTasks;

    const filterStatus = container.dataset.filterStatus || 'All';

    const filteredTasks = filterStatus === 'All'
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

    container.innerHTML = `
      <div class="tasks-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Tasks</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects'} • ${tasks.filter((t) => t.status === 'Completed').length} / ${tasks.length} Completed
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="newTaskBtn">
            + Add Task
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="tab-nav">
          <button class="tab-btn ${filterStatus === 'All' ? 'active' : ''}" data-filter="All">All (${tasks.length})</button>
          <button class="tab-btn ${filterStatus === 'Todo' ? 'active' : ''}" data-filter="Todo">To Do (${tasks.filter((t) => t.status === 'Todo').length})</button>
          <button class="tab-btn ${filterStatus === 'In Progress' ? 'active' : ''}" data-filter="In Progress">In Progress (${tasks.filter((t) => t.status === 'In Progress').length})</button>
          <button class="tab-btn ${filterStatus === 'Completed' ? 'active' : ''}" data-filter="Completed">Completed (${tasks.filter((t) => t.status === 'Completed').length})</button>
        </div>

        ${filteredTasks.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${filteredTasks.map((t) => {
              const isDone = t.status === 'Completed';
              return `
                <div class="card card-hover" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; ${isDone ? 'opacity: 0.7;' : ''}">
                  <div style="display: flex; align-items: center; gap: 0.85rem; flex: 1; min-width: 0;">
                    <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${isDone ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary-500); cursor: pointer;" />
                    <div style="display: flex; flex-direction: column; gap: 0.2rem; min-width: 0;">
                      <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); ${isDone ? 'text-decoration: line-through;' : ''}; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                        ${t.title}
                      </span>
                      <div style="display: flex; align-items: center; gap: 0.6rem; font-size: var(--font-size-xs); color: var(--text-muted); flex-wrap: wrap;">
                        <span class="badge ${t.priority === 'High' ? 'badge-danger' : (t.priority === 'Medium' ? 'badge-warning' : 'badge-neutral')}">${t.priority}</span>
                        ${t.category ? `<span class="badge badge-neutral">${t.category}</span>` : ''}
                        ${t.dueDate ? `<span>Due: ${formatHumanDate(t.dueDate)}</span>` : ''}
                        ${t.estimatedMinutes ? `<span>Est: ${formatMinutes(t.estimatedMinutes)}</span>` : ''}
                        ${t.actualMinutes ? `<span>Act: ${formatMinutes(t.actualMinutes)}</span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <button class="btn btn-ghost btn-sm edit-task-btn" data-id="${t.id}">Edit</button>
                    <button class="btn btn-ghost btn-sm delete-task-btn" data-id="${t.id}">✕</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">✓</div>
            <h3 class="empty-state-title">No tasks in this view</h3>
            <p class="empty-state-desc">Keep your journey organized by breaking down goals into clear tasks.</p>
            <button class="btn btn-primary btn-sm" id="emptyNewTaskBtn">+ Create Task</button>
          </div>
        `}
      </div>
    `;

    // Filter clicks
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        container.dataset.filterStatus = e.currentTarget.dataset.filter;
        TasksModule.render(container, activeProject);
      });
    });

    // Checkbox toggle
    container.querySelectorAll('.task-checkbox').forEach((cb) => {
      cb.addEventListener('change', async (e) => {
        const id = cb.dataset.id;
        const isChecked = cb.checked;
        const task = await Database.get(STORES.TASKS, id);
        if (task) {
          task.status = isChecked ? 'Completed' : 'Todo';
          task.updatedAt = new Date().toISOString();
          await Database.put(STORES.TASKS, task);
          showToast(`Task marked as ${task.status}`, 'info');
          TasksModule.render(container, activeProject);
        }
      });
    });

    // Add task
    const addBtn = container.querySelector('#newTaskBtn') || container.querySelector('#emptyNewTaskBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        TasksModule.openTaskModal(activeProject);
      });
    }

    // Edit task
    container.querySelectorAll('.edit-task-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const task = await Database.get(STORES.TASKS, id);
        if (task) {
          TasksModule.openTaskModal(activeProject, task);
        }
      });
    });

    // Delete task
    container.querySelectorAll('.delete-task-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm('Delete Task', 'Are you sure you want to delete this task?', async () => {
          await Database.delete(STORES.TASKS, id);
          showToast('Task removed', 'info');
          TasksModule.render(container, activeProject);
        }, 'Delete', true);
      });
    });
  }

  static openTaskModal(activeProject, task = null) {
    let modal = document.getElementById('taskModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'taskModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title" id="taskModalTitle">New Task</h3>
            <button class="btn btn-ghost btn-sm" id="closeTaskModalBtn">✕</button>
          </div>
          <form id="taskForm">
            <div class="modal-body">
              <input type="hidden" id="taskId" />

              <div class="form-group">
                <label class="form-label">Task Title *</label>
                <input class="form-input" id="taskTitle" required placeholder="e.g. Master SQL Common Table Expressions" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select class="form-select" id="taskPriority">
                    <option value="High">High</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="taskStatus">
                    <option value="Todo">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Category / Tag</label>
                  <input class="form-input" id="taskCategory" placeholder="e.g. Practice, Portfolio, Reading" />
                </div>
                <div class="form-group">
                  <label class="form-label">Due Date</label>
                  <input type="date" class="form-input" id="taskDueDate" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Estimated Time (Hours)</label>
                  <input type="number" step="0.25" class="form-input" id="taskEstHours" placeholder="1.5" />
                </div>
                <div class="form-group">
                  <label class="form-label">Actual Time Spent (Hours)</label>
                  <input type="number" step="0.25" class="form-input" id="taskActHours" placeholder="1.0" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Task Notes / Acceptance Criteria</label>
                <textarea class="form-textarea" id="taskNotes" placeholder="Specific drills, exercises or deliverables..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelTaskModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Task</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeTaskModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelTaskModalBtn').addEventListener('click', closeModal);

      modal.querySelector('#taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modal.querySelector('#taskId').value || generateUUID();
        const isNew = !modal.querySelector('#taskId').value;

        const record = {
          id,
          projectId: activeProject ? activeProject.id : '',
          title: modal.querySelector('#taskTitle').value.trim(),
          priority: modal.querySelector('#taskPriority').value,
          status: modal.querySelector('#taskStatus').value,
          category: modal.querySelector('#taskCategory').value.trim(),
          dueDate: modal.querySelector('#taskDueDate').value || '',
          estimatedMinutes: hoursToMinutes(parseFloat(modal.querySelector('#taskEstHours').value) || 0),
          actualMinutes: hoursToMinutes(parseFloat(modal.querySelector('#taskActHours').value) || 0),
          description: modal.querySelector('#taskNotes').value.trim(),
          updatedAt: new Date().toISOString()
        };

        if (isNew) {
          record.createdAt = new Date().toISOString();
        }

        await Database.put(STORES.TASKS, record);
        closeModal();
        showToast(isNew ? 'Task created!' : 'Task updated!', 'success');
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#taskForm');
    form.reset();

    if (task) {
      modal.querySelector('#taskModalTitle').textContent = 'Edit Task';
      modal.querySelector('#taskId').value = task.id;
      modal.querySelector('#taskTitle').value = task.title || '';
      modal.querySelector('#taskPriority').value = task.priority || 'Medium';
      modal.querySelector('#taskStatus').value = task.status || 'Todo';
      modal.querySelector('#taskCategory').value = task.category || '';
      modal.querySelector('#taskDueDate').value = task.dueDate || '';
      modal.querySelector('#taskEstHours').value = task.estimatedMinutes ? (task.estimatedMinutes / 60).toFixed(2) : '';
      modal.querySelector('#taskActHours').value = task.actualMinutes ? (task.actualMinutes / 60).toFixed(2) : '';
      modal.querySelector('#taskNotes').value = task.description || '';
    } else {
      modal.querySelector('#taskModalTitle').textContent = 'New Task';
      modal.querySelector('#taskId').value = '';
    }

    openModal('taskModal');
  }
}
