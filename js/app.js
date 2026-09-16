/**
 * Data Journey - Main Application Orchestrator
 */

import { Database } from './database/db.js';
import { STORES } from './database/schema.js';
import { Router } from './router.js';
import { SearchService } from './services/searchService.js';
import { DashboardModule } from './modules/dashboard.js';
import { ProjectsModule } from './modules/projects.js';
import { DailyModule } from './modules/daily.js';
import { TasksModule } from './modules/tasks.js';
import { GoalsModule } from './modules/goals.js';
import { IssuesModule } from './modules/issues.js';
import { TimeTrackerModule } from './modules/timeTracker.js';
import { CalendarModule } from './modules/calendar.js';
import { AnalyticsModule } from './modules/analytics.js';
import { BackupModule } from './modules/backup.js';
import { WelcomeModule } from './modules/welcome.js';
import { DemoService } from './services/demoService.js';
import { getDemoDataset } from './utils/demoData.js';
import { $, openModal, showToast } from './utils/dom.js';

// Immediately capture PWA install prompt at script load time
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('[PWA] beforeinstallprompt event captured and ready.');
});

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null;
  console.log('[PWA] Ascendra was installed successfully.');
  showToast('Ascendra was successfully installed!', 'success');
});

class App {
  constructor() {
    this.activeProject = null;
    this.router = null;
    this.contentContainer = document.getElementById('viewContainer');
  }

  async init() {
    console.log('[App] Bootstrapping Ascendra...');
    
    // 1. Initialize Theme immediately (synchronous)
    this.initTheme();

    // 2. Setup Global UI Events immediately
    this.setupGlobalEvents();

    // 3. Register PWA Service Worker
    this.registerServiceWorker();

    // 4. Initialize Online/Offline state monitor
    this.initNetworkStatusMonitor();

    // 5. Initialize Router immediately (renders Welcome or active route)
    this.setupRouter();

    // 6. Connect Database & resolve active project in background
    try {
      await Database.open();
      await this.loadCustomLogo();
      await this.resolveActiveProject();
      // If currently on dashboard or data view, refresh to reflect loaded project
      if (this.router && this.router.currentRoute && this.router.currentRoute !== 'welcome') {
        this.router.handleRoute();
      }
    } catch (err) {
      console.warn('[App] Database async init notice:', err);
    }

    console.log('[App] Ascendra ready!');
  }

  async loadCustomLogo() {
    try {
      const customLogoSetting = await Database.get(STORES.SETTINGS, 'customLogo');
      const logoEl = $('#sidebarLogoImg');
      if (logoEl && customLogoSetting && customLogoSetting.value) {
        logoEl.src = customLogoSetting.value;
      }
    } catch (e) {
      console.warn('Failed to load custom logo:', e);
    }
  }

  async resolveActiveProject() {
    const projects = await Database.getAll(STORES.PROJECTS);
    const demoDismissed = await DemoService.isDemoDismissed();
    
    if (projects.length === 0 && !demoDismissed) {
      // Auto-load demo 35-Day Data Analyst Journey on initial launch for immediate utility
      console.log('[App] Fresh database detected. Loading 35-Day Data Analyst Journey demo dataset...');
      const demo = getDemoDataset();
      await Database.bulkPut(STORES.PROJECTS, demo.projects);
      await Database.bulkPut(STORES.DAILY_PROGRESS, demo.dailyProgress);
      await Database.bulkPut(STORES.TASKS, demo.tasks);
      await Database.bulkPut(STORES.GOALS, demo.goals);
      await Database.bulkPut(STORES.ISSUES, demo.issues);
      await Database.bulkPut(STORES.BREAKTHROUGHS, demo.breakthroughs);
      await Database.bulkPut(STORES.TIME_ENTRIES, demo.timeEntries);
      await Database.bulkPut(STORES.NOTES, demo.notes);
      await Database.bulkPut(STORES.SETTINGS, demo.settings);

      this.activeProject = demo.projects[0];
    } else if (projects.length === 0) {
      this.activeProject = null;
    } else {
      const activeSetting = await Database.get(STORES.SETTINGS, 'activeProjectId');
      if (activeSetting && activeSetting.value) {
        this.activeProject = await Database.get(STORES.PROJECTS, activeSetting.value);
      }
      if (!this.activeProject) {
        this.activeProject = projects[0];
      }
    }

    this.updateActiveProjectPill();
  }

  updateActiveProjectPill() {
    const pill = $('#activeProjectPill');
    const nameEl = $('#activeProjectName');
    if (pill && nameEl) {
      if (this.activeProject) {
        nameEl.textContent = this.activeProject.name;
        pill.title = `${this.activeProject.name} (${this.activeProject.type})`;
      } else {
        nameEl.textContent = 'No project selected';
        pill.title = 'Click to select or create a project';
      }
    }
  }

  setupRouter() {
    const renderCurrent = async (Module) => {
      document.body.classList.remove('landing-mode');
      if (!this.activeProject) {
        await this.resolveActiveProject();
      }
      Module.render(this.contentContainer, this.activeProject, (newProj) => {
        this.activeProject = newProj;
        this.updateActiveProjectPill();
        this.router.handleRoute();
      });
    };

    const routes = {
      welcome: () => {
        document.body.classList.add('landing-mode');
        WelcomeModule.render(this.contentContainer, () => {
          if (window.location.hash === '#dashboard') {
            this.router.handleRoute();
          } else {
            window.location.hash = '#dashboard';
          }
        });
      },
      dashboard: () => renderCurrent(DashboardModule),
      projects: async () => {
        document.body.classList.remove('landing-mode');
        await this.resolveActiveProject();
        ProjectsModule.render(this.contentContainer, this.activeProject, (newProj) => {
          this.activeProject = newProj;
          this.updateActiveProjectPill();
          this.router.handleRoute();
        });
      },
      daily: () => renderCurrent(DailyModule),
      tasks: () => renderCurrent(TasksModule),
      goals: () => renderCurrent(GoalsModule),
      issues: () => renderCurrent(IssuesModule),
      timetracker: () => renderCurrent(TimeTrackerModule),
      calendar: () => renderCurrent(CalendarModule),
      analytics: () => renderCurrent(AnalyticsModule),
      backup: () => {
        document.body.classList.remove('landing-mode');
        BackupModule.render(this.contentContainer, this.activeProject, async () => {
          await this.resolveActiveProject();
          this.router.handleRoute();
        });
      }
    };

    this.router = new Router(routes, 'welcome');
    this.router.init();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('dj_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleIcon(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('dj_theme', nextTheme);
    this.updateThemeToggleIcon(nextTheme);
  }

  updateThemeToggleIcon(theme) {
    const btn = $('#themeToggleBtn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`;
    }
  }

  setupGlobalEvents() {
    // Theme toggle
    $('#themeToggleBtn').addEventListener('click', () => this.toggleTheme());

    // Sidebar active project click -> projects view
    $('#activeProjectPill').addEventListener('click', () => {
      window.location.hash = '#projects';
    });

    // Mobile sidebar toggle
    const menuToggle = $('#mobileMenuToggle');
    const sidebar = $('#sidebar');
    const backdrop = $('#sidebarBackdrop');

    if (menuToggle && sidebar && backdrop) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });

      // Close sidebar when clicking any navigation link on mobile
      document.querySelectorAll('.nav-link').forEach((l) => {
        l.addEventListener('click', () => {
          sidebar.classList.remove('open');
          backdrop.classList.remove('active');
        });
      });
    }

    // Global Search Input
    const searchInput = $('#globalSearchInput');
    const searchResults = $('#globalSearchResults');

    if (searchInput && searchResults) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value;
        if (!query || query.trim().length < 2) {
          searchResults.style.display = 'none';
          return;
        }

        debounceTimer = setTimeout(async () => {
          const results = await SearchService.searchAll(query, this.activeProject ? this.activeProject.id : null);
          if (results.length > 0) {
            searchResults.innerHTML = results.slice(0, 8).map((r) => `
              <div class="search-result-item" data-route="${r.targetRoute}" style="padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--border-subtle); cursor: pointer; display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1rem;">${r.icon}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${r.title}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${r.subtitle}</div>
                </div>
                <span class="badge badge-neutral" style="font-size: 0.65rem;">${r.type}</span>
              </div>
            `).join('');
            searchResults.style.display = 'block';

            searchResults.querySelectorAll('.search-result-item').forEach((item) => {
              item.addEventListener('click', () => {
                window.location.hash = item.dataset.route;
                searchResults.style.display = 'none';
                searchInput.value = '';
              });
            });
          } else {
            searchResults.innerHTML = `
              <div style="padding: 0.85rem; text-align: center; color: var(--text-muted); font-size: var(--font-size-xs);">
                No matching records found.
              </div>
            `;
            searchResults.style.display = 'block';
          }
        }, 180);
      });

      // Hide search dropdown on blur / click outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.style.display = 'none';
        }
      });
    }

    // Quick Action Bar: + New Record Progress
    const quickRecordBtn = $('#quickRecordProgressBtn');
    if (quickRecordBtn) {
      quickRecordBtn.addEventListener('click', () => {
        if (!this.activeProject) {
          showToast('Please create or select a project first!', 'info');
          window.location.hash = '#projects';
        } else {
          DailyModule.openDailyModal(this.activeProject);
        }
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K focuses search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // PWA Install Prompt Capture for Welcome Page and App Actions
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('[PWA] beforeinstallprompt event captured and ready.');
    });
  }

  initNetworkStatusMonitor() {
    window.addEventListener('online', () => this.updateNetworkStatus());
    window.addEventListener('offline', () => this.updateNetworkStatus());
    this.updateNetworkStatus();
  }

  updateNetworkStatus() {
    const dot = $('#networkStatusDot');
    const label = $('#networkStatusText');
    if (!dot || !label) return;

    const isSwControlling = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);

    if (navigator.onLine) {
      dot.className = 'status-indicator-dot';
      label.textContent = isSwControlling
        ? 'Offline-Ready • App Cached & IndexedDB Ready'
        : 'Online • Local Persistent Storage';
    } else {
      dot.className = 'status-indicator-dot offline';
      label.textContent = 'Offline Mode Active • Running Locally via IndexedDB';
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      const doRegister = () => {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
          .then((reg) => {
            console.log('[ServiceWorker] Successfully registered with scope:', reg.scope);
            this.updateNetworkStatus();
            // Prompt update check
            if (reg.update) {
              reg.update().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn('[ServiceWorker] Registration notice:', err.message);
          });
      };

      if (document.readyState === 'complete') {
        doRegister();
      } else {
        window.addEventListener('load', doRegister);
      }

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorker] Controller updated; now serving latest cache.');
        this.updateNetworkStatus();
      });
    }
  }
}

// Bootstrap on DOM ready
const bootstrap = () => {
  const app = new App();
  app.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
