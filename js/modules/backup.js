/**
 * Data Journey - Backup, Export, Import & Demo Data Module
 * Sections 15 & 16 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { DemoService } from '../services/demoService.js';
import { getDemoDataset } from '../utils/demoData.js';
import { showToast, showConfirm } from '../utils/dom.js';

export class BackupModule {
  static async render(container, activeProject, onDataReloaded) {
    const projects = await Database.getAll(STORES.PROJECTS);
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    const tasks = await Database.getAll(STORES.TASKS);
    const goals = await Database.getAll(STORES.GOALS);
    const issues = await Database.getAll(STORES.ISSUES);
    const timeEntries = await Database.getAll(STORES.TIME_ENTRIES);

    const hasDemoData = await DemoService.hasDemoData();

    const customLogoSetting = await Database.get(STORES.SETTINGS, 'customLogo');
    const currentLogoSrc = customLogoSetting && customLogoSetting.value ? customLogoSetting.value : './assets/icons/ascendra-logo.png';

    container.innerHTML = `
      <div class="backup-view">
        <div style="margin-bottom: 1.5rem;">
          <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Data & Settings</h1>
          <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
            Complete local data sovereignty. Customize app branding, export your journey, or restore snapshots.
          </p>
        </div>

        <!-- App Branding & Custom Logo Card -->
        <div class="card" style="margin-bottom: 1.5rem; border-top: 3px solid var(--accent-cyan);">
          <div class="card-header">
            <div>
              <h3 class="card-title">App Branding & Custom Logo</h3>
              <span class="card-subtitle">Personalize Ascendra with your own uploaded logo or use the default icon</span>
            </div>
            <span style="font-size: 1.5rem;">🎨</span>
          </div>

          <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;">
            <div style="width: 68px; height: 68px; border-radius: var(--radius-lg); border: 2px solid var(--border-medium); overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--shadow-glow);">
              <img id="brandingPreviewImg" src="${currentLogoSrc}" alt="Ascendra Logo" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            <div style="flex: 1; min-width: 240px;">
              <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.75rem;">
                Upload any custom image (PNG, JPG, SVG, WebP) from your device. It will be saved locally into your IndexedDB settings and displayed across the navigation bar.
              </p>
              <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                <input type="file" id="logoUploadInput" accept="image/*" style="display: none;" />
                <button class="btn btn-primary btn-sm" id="uploadLogoBtn">
                  📁 Upload Custom Logo
                </button>
                <button class="btn btn-secondary btn-sm" id="resetLogoBtn">
                  ↺ Reset to Default Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning / Info Box -->
        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
          <h4 style="font-size: var(--font-size-sm); color: var(--primary-400); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
            🛡️ 100% Private, Local-First Architecture
          </h4>
          <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.5;">
            Your progress, notes, and study logs are stored entirely within your browser's persistent IndexedDB storage.
            No data is ever transmitted to a cloud server or external third party. To safeguard your work across browser resets
            or device migrations, export regular JSON backups below.
          </p>
        </div>

        <!-- Database Storage Overview -->
        <div class="card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <h3 class="card-title">Local Storage Footprint</h3>
            <span class="badge badge-success">IndexedDB Active</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; text-align: center;">
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${projects.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Projects</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${dailyRecords.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Daily Logs</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${tasks.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Tasks</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${goals.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Goals</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${issues.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Issues</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${timeEntries.length}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Time Logs</div>
            </div>
          </div>
        </div>

        <!-- Export & Import Controls -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
          
          <!-- Export Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Export Backup</h3>
                <span class="card-subtitle">Download your complete journey snapshot</span>
              </div>
              <span style="font-size: 1.5rem;">📥</span>
            </div>
            <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1.25rem;">
              Generates a verified, portable <code>ascendra-backup.json</code> file containing all projects, daily reflections, time logs, and goals.
            </p>
            <button class="btn btn-primary btn-sm" id="exportBackupBtn">
              Download JSON Backup
            </button>
          </div>

          <!-- Import Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Import / Restore</h3>
                <span class="card-subtitle">Restore from previous JSON file</span>
              </div>
              <span style="font-size: 1.5rem;">📤</span>
            </div>
            
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label class="form-label">Import Mode</label>
              <select class="form-select" id="importModeSelect">
                <option value="replace">Full Restore (Replace current data)</option>
                <option value="merge">Smart Merge (Combine with existing records)</option>
              </select>
            </div>

            <input type="file" id="importFileInput" accept=".json,application/json" style="display: none;" />
            <button class="btn btn-secondary btn-sm" id="importBackupBtn">
              Select Backup File to Import...
            </button>
          </div>

        </div>

        <!-- Demo Data & Reset Area -->
        <div class="card" style="margin-bottom: 1.5rem; border-top: 3px solid var(--primary-500);">
          <div class="card-header">
            <div>
              <h3 class="card-title">Demo / Sample Project Management</h3>
              <span class="card-subtitle">Sections 17–24 of Specification: Removable & Restorable Demo Project</span>
            </div>
            <span style="font-size: 1.5rem;">📁</span>
          </div>

          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
            ${hasDemoData ? `
              Ascendra is currently loaded with the <strong>35-Day Data Analyst Journey</strong> sample dataset. You can remove all demo records to start with a clean workspace. Real user projects and data will not be affected.
            ` : `
              The sample project is currently removed. You can restore it anytime to explore how projects, tasks, goals, and analytics operate without affecting your personal projects.
            `}
          </p>

          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            ${hasDemoData ? `
              <button class="btn btn-danger btn-sm" id="btnRemoveDemoData">
                🗑️ Remove Demo Data
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" id="btnRestoreDemoData">
                🚀 Restore Demo Project
              </button>
            `}
          </div>
        </div>

        <!-- Factory Reset Area -->
        <div class="card" style="border-top: 3px solid var(--warning-500);">
          <div class="card-header">
            <div>
              <h3 class="card-title">Factory Reset</h3>
              <span class="card-subtitle">Permanent wipe of all data and settings</span>
            </div>
            <span style="font-size: 1.5rem;">⚙️</span>
          </div>

          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
            Permanently clear all records, custom projects, settings, and logs from this browser.
          </p>

          <button class="btn btn-danger btn-sm" id="wipeAllDataBtn">
            ⚠️ Wipe All Data (Factory Reset)
          </button>
        </div>

      </div>
    `;

    // Logo Upload Handlers
    const logoInput = container.querySelector('#logoUploadInput');
    const uploadLogoBtn = container.querySelector('#uploadLogoBtn');
    const resetLogoBtn = container.querySelector('#resetLogoBtn');
    const previewImg = container.querySelector('#brandingPreviewImg');
    const sidebarLogo = document.getElementById('sidebarLogoImg');

    if (uploadLogoBtn && logoInput) {
      uploadLogoBtn.addEventListener('click', () => {
        logoInput.value = '';
        logoInput.click();
      });

      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          await Database.put(STORES.SETTINGS, { key: 'customLogo', value: dataUrl });
          if (previewImg) previewImg.src = dataUrl;
          if (sidebarLogo) sidebarLogo.src = dataUrl;
          showToast('Custom logo uploaded and applied to Ascendra!', 'success');
        };
        reader.readAsDataURL(file);
      });
    }

    if (resetLogoBtn) {
      resetLogoBtn.addEventListener('click', async () => {
        await Database.delete(STORES.SETTINGS, 'customLogo');
        if (previewImg) previewImg.src = './assets/icons/ascendra-logo.png';
        if (sidebarLogo) sidebarLogo.src = './assets/icons/ascendra-logo.png';
        showToast('Logo reset to Ascendra default.', 'info');
      });
    }

    // Export Handler
    container.querySelector('#exportBackupBtn').addEventListener('click', async () => {
      try {
        const backupData = await Database.exportAll();
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const dateTag = new Date().toISOString().split('T')[0];
        a.download = `ascendra-backup-${dateTag}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Ascendra backup downloaded successfully!', 'success');
      } catch (err) {
        showToast(`Export failed: ${err.message}`, 'error');
      }
    });

    // Import Handlers
    const fileInput = container.querySelector('#importFileInput');
    const importBtn = container.querySelector('#importBackupBtn');
    const modeSelect = container.querySelector('#importModeSelect');

    importBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!parsed.stores || !parsed.app) {
            throw new Error('Invalid Ascendra backup schema. Missing "stores" attribute.');
          }

          const mode = modeSelect.value;
          const confirmMsg = mode === 'replace'
            ? 'Warning: Full Restore will replace your current local records with this backup. Do you want to proceed?'
            : 'Merge this backup with your existing records?';

          showConfirm('Confirm Import', confirmMsg, async () => {
            await Database.importAll(parsed, mode);
            showToast('Backup restored successfully!', 'success');
            if (onDataReloaded) onDataReloaded();
          });
        } catch (err) {
          showToast(`Import error: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    });



    // Remove Demo Data button
    const removeDemoBtn = container.querySelector('#btnRemoveDemoData');
    if (removeDemoBtn) {
      removeDemoBtn.addEventListener('click', () => {
        showConfirm(
          'Remove Demo Data?',
          'This will remove the demo project and all of its sample records. Your own projects and data will not be affected.',
          async () => {
            await DemoService.removeDemoData();
            showToast('Demo project and records removed.', 'info');
            if (onDataReloaded) onDataReloaded();
          },
          'Remove Demo Data',
          true
        );
      });
    }

    // Restore Demo Data button
    const restoreDemoBtn = container.querySelector('#btnRestoreDemoData');
    if (restoreDemoBtn) {
      restoreDemoBtn.addEventListener('click', () => {
        showConfirm(
          'Restore Demo Project?',
          'This will load the 35-Day Data Analyst sample dataset. Your own projects and data will not be overwritten or deleted.',
          async () => {
            await DemoService.restoreDemoData();
            showToast('Demo project restored successfully.', 'success');
            if (onDataReloaded) onDataReloaded();
          },
          'Restore Demo',
          false
        );
      });
    }

    // Factory Reset
    container.querySelector('#wipeAllDataBtn').addEventListener('click', () => {
      showConfirm(
        'Factory Reset',
        'WARNING: This will permanently wipe all projects, logs, tasks, and settings from this browser! Make sure you have exported a backup first.',
        async () => {
          await Database.clearAllStores();
          showToast('All local data wiped.', 'info');
          if (onDataReloaded) onDataReloaded();
        },
        'Wipe All Data',
        true
      );
    });
  }
}
