/**
 * Data Journey - Interactive Calendar Module
 * Section 5.9 of Specification.
 */

import { Database } from '../database/db.js';
import { STORES } from '../database/schema.js';
import { formatDateString, formatHumanDate, formatMinutes, getTodayDateString } from '../utils/dateUtils.js';
import { DailyModule } from './daily.js';

let currentCalMonth = new Date().getMonth();
let currentCalYear = new Date().getFullYear();

export class CalendarModule {
  static async render(container, activeProject) {
    const dailyRecords = await Database.getAll(STORES.DAILY_PROGRESS);
    const goals = await Database.getAll(STORES.GOALS);
    const tasks = await Database.getAll(STORES.TASKS);

    const projectDaily = activeProject
      ? dailyRecords.filter((d) => d.projectId === activeProject.id)
      : dailyRecords;

    const projectGoals = activeProject
      ? goals.filter((g) => g.projectId === activeProject.id)
      : goals;

    const projectTasks = activeProject
      ? tasks.filter((t) => t.projectId === activeProject.id)
      : tasks;

    // Date to record mappings
    const dailyDateMap = {};
    projectDaily.forEach((d) => {
      dailyDateMap[d.date] = d;
    });

    const deadlineDateMap = {};
    projectGoals.forEach((g) => {
      if (g.targetDate) {
        if (!deadlineDateMap[g.targetDate]) deadlineDateMap[g.targetDate] = [];
        deadlineDateMap[g.targetDate].push(`🎯 Goal: ${g.title}`);
      }
    });
    projectTasks.forEach((t) => {
      if (t.dueDate) {
        if (!deadlineDateMap[t.dueDate]) deadlineDateMap[t.dueDate] = [];
        deadlineDateMap[t.dueDate].push(`✓ Task: ${t.title}`);
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    container.innerHTML = `
      <div class="calendar-view">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: var(--font-size-2xl); font-weight: 800; letter-spacing: -0.02em;">Journey Calendar</h1>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
              ${activeProject ? activeProject.name : 'All Projects'} • Visual schedule of study sessions, deadlines, and milestones.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" id="calPrevMonthBtn">← Prev</button>
            <strong style="min-width: 140px; text-align: center; font-size: var(--font-size-base);">
              ${monthNames[currentCalMonth]} ${currentCalYear}
            </strong>
            <button class="btn btn-secondary btn-sm" id="calNextMonthBtn">Next →</button>
            <button class="btn btn-ghost btn-sm" id="calTodayBtn">Today</button>
          </div>
        </div>

        <!-- Legend -->
        <div style="display: flex; gap: 1.25rem; font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: 1rem; flex-wrap: wrap;">
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--success-500); display: inline-block;"></span>
            Study Completed (≥ 1 hr)
          </span>
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--warning-500); display: inline-block;"></span>
            Partial Study (< 1 hr)
          </span>
          <span style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--accent-purple); display: inline-block;"></span>
            Deadline / Milestone
          </span>
        </div>

        <!-- Month Calendar Grid Card -->
        <div class="card" style="padding: 1rem;">
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 700; font-size: var(--font-size-xs); color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;" id="calendarMonthCells">
            <!-- Calendar cells inserted here -->
          </div>
        </div>

        <!-- Selected Day Details Container -->
        <div class="card" id="calSelectedDayCard" style="margin-top: 1.25rem; display: none;">
          <div class="card-header">
            <h3 class="card-title" id="calSelectedDayTitle">Day Details</h3>
            <button class="btn btn-primary btn-sm" id="calSelectedDayActionBtn">+ Record / Edit Day</button>
          </div>
          <div id="calSelectedDayBody" style="font-size: var(--font-size-sm); color: var(--text-secondary);"></div>
        </div>
      </div>
    `;

    // Populate calendar grid cells
    CalendarModule.renderMonthCells(container, dailyDateMap, deadlineDateMap, activeProject);

    // Event listeners
    container.querySelector('#calPrevMonthBtn').addEventListener('click', () => {
      currentCalMonth--;
      if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
      }
      CalendarModule.render(container, activeProject);
    });

    container.querySelector('#calNextMonthBtn').addEventListener('click', () => {
      currentCalMonth++;
      if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
      }
      CalendarModule.render(container, activeProject);
    });

    container.querySelector('#calTodayBtn').addEventListener('click', () => {
      currentCalMonth = new Date().getMonth();
      currentCalYear = new Date().getFullYear();
      CalendarModule.render(container, activeProject);
    });
  }

  static renderMonthCells(container, dailyMap, deadlineMap, activeProject) {
    const cellsGrid = container.querySelector('#calendarMonthCells');
    const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
    const todayStr = getTodayDateString();

    const cellsHtml = [];

    // Empty lead-in padding days
    for (let i = 0; i < firstDay; i++) {
      cellsHtml.push(`
        <div style="height: 84px; background: transparent; border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); opacity: 0.25;"></div>
      `);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(currentCalYear, currentCalMonth, d);
      const dateStr = formatDateString(cellDate);
      const daily = dailyMap[dateStr];
      const deadlines = deadlineMap[dateStr];
      const isToday = dateStr === todayStr;

      let cellBg = 'var(--bg-surface-elevated)';
      let borderStyle = isToday ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)';

      if (daily) {
        if ((daily.actualMinutes || 0) >= 60) {
          cellBg = 'rgba(16, 185, 129, 0.12)';
        } else if ((daily.actualMinutes || 0) > 0) {
          cellBg = 'rgba(245, 158, 11, 0.12)';
        }
      }

      cellsHtml.push(`
        <div class="cal-day-cell" data-date="${dateStr}" style="height: 84px; background: ${cellBg}; border: ${borderStyle}; border-radius: var(--radius-md); padding: 0.4rem; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: transform var(--transition-fast);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: var(--font-size-xs); font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--primary-400)' : 'var(--text-primary)'};">
              ${d}
            </span>
            ${daily ? `<span class="badge ${daily.actualMinutes >= 60 ? 'badge-success' : 'badge-warning'}" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">${daily.actualMinutes}m</span>` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.15rem; overflow: hidden;">
            ${daily ? `<span style="font-size: 0.65rem; color: var(--text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">Day ${daily.dayNumber}: ${daily.sectionWorkedOn || ''}</span>` : ''}
            ${deadlines ? `<span style="font-size: 0.65rem; color: var(--accent-purple); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${deadlines[0]}</span>` : ''}
          </div>
        </div>
      `);
    }

    cellsGrid.innerHTML = cellsHtml.join('');

    // Handle day cell clicks
    cellsGrid.querySelectorAll('.cal-day-cell').forEach((cell) => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.dataset.date;
        const daily = dailyMap[dateStr];
        const deadlines = deadlineMap[dateStr];

        const card = container.querySelector('#calSelectedDayCard');
        const title = container.querySelector('#calSelectedDayTitle');
        const body = container.querySelector('#calSelectedDayBody');
        const actionBtn = container.querySelector('#calSelectedDayActionBtn');

        card.style.display = 'block';
        title.textContent = formatHumanDate(dateStr);

        let content = '';
        if (daily) {
          content += `
            <div style="margin-bottom: 0.5rem;">
              <strong style="color: var(--text-primary); font-size: 1rem;">Day ${daily.dayNumber}: ${daily.sectionWorkedOn}</strong>
              <span class="badge badge-success" style="margin-left: 0.5rem;">${formatMinutes(daily.actualMinutes)}</span>
            </div>
            ${daily.whatILearned ? `<p style="margin-bottom: 0.35rem;"><strong>Learned:</strong> ${daily.whatILearned}</p>` : ''}
            ${daily.breakthrough ? `<p style="color: var(--accent-cyan); margin-bottom: 0.35rem;"><strong>Breakthrough:</strong> ${daily.breakthrough}</p>` : ''}
            ${daily.challenge ? `<p style="color: var(--warning-500);"><strong>Challenge:</strong> ${daily.challenge}</p>` : ''}
          `;
          actionBtn.textContent = 'Edit Day Record';
          actionBtn.onclick = () => DailyModule.openDailyModal(activeProject, daily);
        } else {
          content = `<p>No study session recorded on this date.</p>`;
          actionBtn.textContent = '+ Record Progress for this Day';
          actionBtn.onclick = () => {
            DailyModule.openDailyModal(activeProject, null, 1);
            setTimeout(() => {
              const dateInput = document.getElementById('dailyDate');
              if (dateInput) dateInput.value = dateStr;
            }, 100);
          };
        }

        if (deadlines && deadlines.length > 0) {
          content += `
            <div style="margin-top: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
              <strong style="color: var(--accent-purple);">Deadlines & Milestones:</strong>
              <ul style="padding-left: 1.25rem; margin-top: 0.25rem;">
                ${deadlines.map((dl) => `<li>${dl}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        body.innerHTML = content;
        card.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
}
