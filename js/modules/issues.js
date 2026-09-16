/**
 * Data Journey - Issues, Challenges & Breakthroughs Module
 * Section 5.6 & 5.7 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { generateUUID } from '../utils/uuid.js';
import { formatHumanDate, getTodayDateString } from '../utils/dateUtils.js';
import { openModal, closeModal, showToast, showConfirm } from '../utils/dom.js';

export class IssuesModule {
  static async render(container, activeProject) {
    const allIssues = await Database.getAll(STORES.ISSUES);
    const allBreakthroughs = await Database.getAll(STORES.BREAKTHROUGHS);

    const issues = activeProject ? allIssues.filter((i) => i.projectId === activeProject.id) : allIssues;
    const breakthroughs = activeProject ? allBreakthroughs.filter((b) => b.projectId === activeProject.id) : allBreakthroughs;

    const activeTab = container.dataset.activeTab || 'issues';

    container.innerHTML = `
      <div class="issues-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">
              Challenges & Breakthroughs
            </h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects'} • Document roadblocks, solutions, and key breakthroughs.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" id="newBreakthroughBtn">
              💡 + Add Breakthrough
            </button>
            <button class="btn btn-primary btn-sm" id="newIssueBtn">
              ⚠️ + Log Issue / Blocker
            </button>
          </div>
        </div>

        <div class="tab-nav">
          <button class="tab-btn ${activeTab === 'issues' ? 'active' : ''}" data-tab="issues">
            Issues & Blockers (${issues.length})
          </button>
          <button class="tab-btn ${activeTab === 'breakthroughs' ? 'active' : ''}" data-tab="breakthroughs">
            Breakthroughs & Wins (${breakthroughs.length})
          </button>
        </div>

        ${activeTab === 'issues' ? `
          ${issues.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${issues.map((iss) => {
                const isResolved = iss.status === 'Resolved';
                return `
                  <div class="card card-hover" style="border-left: 4px solid ${isResolved ? 'var(--success-500)' : 'var(--danger-500)'};">
                    <div class="card-header" style="margin-bottom: 0.5rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span class="badge ${isResolved ? 'badge-success' : 'badge-danger'}">${iss.status || 'Open'}</span>
                        <h3 class="card-title" style="font-size: 1.05rem;">${iss.title}</h3>
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span class="badge ${iss.severity === 'High' ? 'badge-danger' : (iss.severity === 'Medium' ? 'badge-warning' : 'badge-neutral')}">
                          ${iss.severity} Severity
                        </span>
                        <button class="btn btn-ghost btn-sm edit-issue-btn" data-id="${iss.id}">Edit</button>
                        <button class="btn btn-ghost btn-sm delete-issue-btn" data-id="${iss.id}">✕</button>
                      </div>
                    </div>

                    <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.75rem;">
                      ${iss.description || 'No description provided.'}
                    </p>

                    ${iss.actualSolution ? `
                      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.75rem; border-radius: var(--radius-md); font-size: var(--font-size-xs); color: var(--text-primary); margin-bottom: 0.5rem;">
                        <strong style="color: var(--success-500); display: block; margin-bottom: 0.15rem;">✓ Solution Applied:</strong>
                        ${iss.actualSolution}
                      </div>
                    ` : (iss.possibleSolution ? `
                      <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md); font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong style="display: block; margin-bottom: 0.15rem;">Proposed Solution:</strong>
                        ${iss.possibleSolution}
                      </div>
                    ` : '')}

                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
                      <span>Identified: ${formatHumanDate(iss.date)}</span>
                      ${iss.resolutionDate ? `<span>Resolved: ${formatHumanDate(iss.resolutionDate)}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">⚠️</div>
              <h3 class="empty-state-title">No issues logged</h3>
              <p class="empty-state-desc">When you encounter bugs, difficult concepts or obstacles, record them here along with solutions.</p>
              <button class="btn btn-primary btn-sm" id="emptyNewIssueBtn">+ Log Blocker</button>
            </div>
          `}
        ` : `
          <!-- Breakthroughs View -->
          ${breakthroughs.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
              ${breakthroughs.map((b) => `
                <div class="card card-hover" style="border-top: 3px solid var(--accent-cyan);">
                  <div class="card-header" style="margin-bottom: 0.5rem;">
                    <span class="badge badge-primary">${b.category || 'Insight'}</span>
                    <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatHumanDate(b.date)}</span>
                  </div>

                  <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 0.5rem;">
                    💡 ${b.title}
                  </h3>

                  <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">
                    ${b.description || 'No notes.'}
                  </p>

                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; font-size: var(--font-size-xs);">
                    <span class="badge ${b.importance === 'High' ? 'badge-success' : 'badge-neutral'}">${b.importance || 'Normal'} Impact</span>
                    <button class="btn btn-ghost btn-sm delete-breakthrough-btn" data-id="${b.id}">✕ Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">💡</div>
              <h3 class="empty-state-title">No breakthroughs recorded yet</h3>
              <p class="empty-state-desc">Every time you master a tough concept or discover a fast solution, record it here.</p>
              <button class="btn btn-secondary btn-sm" id="emptyNewBreakthroughBtn">+ Add Breakthrough</button>
            </div>
          `}
        `}
      </div>
    `;

    // Tab switcher
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        container.dataset.activeTab = e.currentTarget.dataset.tab;
        IssuesModule.render(container, activeProject);
      });
    });

    // Add buttons
    const addIssueBtn = container.querySelector('#newIssueBtn') || container.querySelector('#emptyNewIssueBtn');
    if (addIssueBtn) addIssueBtn.addEventListener('click', () => IssuesModule.openIssueModal(activeProject));

    const addBtBtn = container.querySelector('#newBreakthroughBtn') || container.querySelector('#emptyNewBreakthroughBtn');
    if (addBtBtn) addBtBtn.addEventListener('click', () => IssuesModule.openBreakthroughModal(activeProject));

    // Edit/Delete handlers
    container.querySelectorAll('.edit-issue-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const iss = await Database.get(STORES.ISSUES, id);
        if (iss) IssuesModule.openIssueModal(activeProject, iss);
      });
    });

    container.querySelectorAll('.delete-issue-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm('Delete Issue', 'Delete this issue record?', async () => {
          await Database.delete(STORES.ISSUES, id);
          showToast('Issue deleted', 'info');
          IssuesModule.render(container, activeProject);
        }, 'Delete', true);
      });
    });

    container.querySelectorAll('.delete-breakthrough-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        showConfirm('Delete Breakthrough', 'Delete this breakthrough entry?', async () => {
          await Database.delete(STORES.BREAKTHROUGHS, id);
          showToast('Breakthrough deleted', 'info');
          IssuesModule.render(container, activeProject);
        }, 'Delete', true);
      });
    });
  }

  static openIssueModal(activeProject, issue = null) {
    let modal = document.getElementById('issueModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'issueModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title" id="issueModalTitle">Log Issue / Blocker</h3>
            <button class="btn btn-ghost btn-sm" id="closeIssueModalBtn">✕</button>
          </div>
          <form id="issueForm">
            <div class="modal-body">
              <input type="hidden" id="issueId" />

              <div class="form-group">
                <label class="form-label">Issue Title *</label>
                <input class="form-input" id="issueTitle" required placeholder="e.g. Cartesian product row explosion during SQL join" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Severity</label>
                  <select class="form-select" id="issueSeverity">
                    <option value="High">High (Blocker)</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="issueStatus">
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Problem Description</label>
                <textarea class="form-textarea" id="issueDescription" placeholder="What unexpected behavior occurred? Error logs, queries..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Possible Solutions / Hypotheses</label>
                <input class="form-input" id="issuePossibleSolution" placeholder="Ideas on how to fix..." />
              </div>

              <div class="form-group">
                <label class="form-label">Actual Verified Solution</label>
                <textarea class="form-textarea" id="issueActualSolution" placeholder="How did you ultimately fix it? What was the root cause?"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date Identified</label>
                  <input type="date" class="form-input" id="issueDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Resolution Date</label>
                  <input type="date" class="form-input" id="issueResDate" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelIssueModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Issue</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeIssueModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelIssueModalBtn').addEventListener('click', closeModal);

      modal.querySelector('#issueForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modal.querySelector('#issueId').value || generateUUID();
        const isNew = !modal.querySelector('#issueId').value;

        const record = {
          id,
          projectId: activeProject ? activeProject.id : '',
          title: modal.querySelector('#issueTitle').value.trim(),
          severity: modal.querySelector('#issueSeverity').value,
          status: modal.querySelector('#issueStatus').value,
          description: modal.querySelector('#issueDescription').value.trim(),
          possibleSolution: modal.querySelector('#issuePossibleSolution').value.trim(),
          actualSolution: modal.querySelector('#issueActualSolution').value.trim(),
          date: modal.querySelector('#issueDate').value || getTodayDateString(),
          resolutionDate: modal.querySelector('#issueResDate').value || '',
          updatedAt: new Date().toISOString()
        };

        if (isNew) record.createdAt = new Date().toISOString();

        await Database.put(STORES.ISSUES, record);
        closeModal();
        showToast(isNew ? 'Issue logged!' : 'Issue updated!', 'success');
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#issueForm');
    form.reset();

    if (issue) {
      modal.querySelector('#issueModalTitle').textContent = 'Edit Issue';
      modal.querySelector('#issueId').value = issue.id;
      modal.querySelector('#issueTitle').value = issue.title || '';
      modal.querySelector('#issueSeverity').value = issue.severity || 'Medium';
      modal.querySelector('#issueStatus').value = issue.status || 'Open';
      modal.querySelector('#issueDescription').value = issue.description || '';
      modal.querySelector('#issuePossibleSolution').value = issue.possibleSolution || '';
      modal.querySelector('#issueActualSolution').value = issue.actualSolution || '';
      modal.querySelector('#issueDate').value = issue.date || '';
      modal.querySelector('#issueResDate').value = issue.resolutionDate || '';
    } else {
      modal.querySelector('#issueModalTitle').textContent = 'Log Issue / Blocker';
      modal.querySelector('#issueId').value = '';
      modal.querySelector('#issueDate').value = getTodayDateString();
    }

    openModal('issueModal');
  }

  static openBreakthroughModal(activeProject) {
    let modal = document.getElementById('breakthroughModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'breakthroughModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="card-title">💡 Record Breakthrough / Win</h3>
            <button class="btn btn-ghost btn-sm" id="closeBtModalBtn">✕</button>
          </div>
          <form id="btForm">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Breakthrough Title *</label>
                <input class="form-input" id="btTitle" required placeholder="e.g. Mastered SQL Window Functions!" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="form-select" id="btCategory">
                    <option value="Technical">Technical Insight</option>
                    <option value="Efficiency">Speed / Efficiency</option>
                    <option value="Milestone">Major Milestone</option>
                    <option value="Mindset">Mindset / Habit</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Importance</label>
                  <select class="form-select" id="btImportance">
                    <option value="High" selected>High Impact</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description / Reflection</label>
                <textarea class="form-textarea" id="btDescription" placeholder="What clicked? What problem did this unlock?"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="btDate" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" id="cancelBtModalBtn">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm">Save Breakthrough</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeBtModalBtn').addEventListener('click', closeModal);
      modal.querySelector('#cancelBtModalBtn').addEventListener('click', closeModal);

      modal.querySelector('#btForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const record = {
          id: generateUUID(),
          projectId: activeProject ? activeProject.id : '',
          title: modal.querySelector('#btTitle').value.trim(),
          category: modal.querySelector('#btCategory').value,
          importance: modal.querySelector('#btImportance').value,
          description: modal.querySelector('#btDescription').value.trim(),
          date: modal.querySelector('#btDate').value || getTodayDateString(),
          createdAt: new Date().toISOString()
        };

        await Database.put(STORES.BREAKTHROUGHS, record);
        closeModal();
        showToast('Breakthrough added to your trophy showcase!', 'success');
        window.dispatchEvent(new Event('hashchange'));
      });
    }

    const form = modal.querySelector('#btForm');
    form.reset();
    modal.querySelector('#btDate').value = getTodayDateString();
    openModal('breakthroughModal');
  }
}
