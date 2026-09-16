/**
 * Ascendra - Welcome / Landing Page Module
 * Fulfills Sections 3-16 of Product Update Specification (ASCENDRA.docx)
 */

import { openModal } from '../utils/dom.js';

export class WelcomeModule {
  static render(container, onOpenApp) {
    container.innerHTML = `
      <div class="welcome-page">
        <!-- 1. Header / Navigation -->
        <header class="welcome-header">
          <div class="welcome-container welcome-header-inner">
            <a href="#welcome" class="welcome-brand">
              <div class="welcome-logo-box">
                <img src="./assets/icons/ascendra-logo.png" alt="Ascendra Logo" width="32" height="32" />
              </div>
              <div class="welcome-brand-text">
                <span class="welcome-brand-name">ASCENDRA</span>
                <span class="welcome-brand-tagline">Track. Build. Grow.</span>
              </div>
            </a>

            <nav class="welcome-nav" id="welcomeNav">
              <a href="#welcome-hero" class="welcome-nav-link">Home</a>
              <a href="#welcome-why" class="welcome-nav-link">Overview</a>
              <a href="#welcome-features" class="welcome-nav-link">Features</a>
              <a href="#welcome-how" class="welcome-nav-link">How It Works</a>
              <a href="#welcome-analytics" class="welcome-nav-link">Analytics</a>
              <a href="#welcome-install" class="welcome-nav-link" id="welcomeNavInstallLink">Install App</a>
              <a href="#welcome-about" class="welcome-nav-link">About</a>
            </nav>

            <div class="welcome-header-actions">
              <button class="btn btn-primary btn-sm" id="welcomeHeaderOpenBtn">
                Open Ascendra →
              </button>
              <button class="welcome-mobile-toggle" id="welcomeMobileToggle" aria-label="Toggle navigation">
                ☰
              </button>
            </div>
          </div>
        </header>

        <!-- 2. Hero Section -->
        <section class="welcome-hero" id="welcome-hero">
          <div class="welcome-container">
            <div class="welcome-hero-content">
              <div class="welcome-badge-pill">
                <span>✨</span> Standalone • Offline-Ready • IndexedDB Storage
              </div>
              <h1 class="welcome-hero-title">
                Turn Your Effort <br class="desktop-only" />
                Into <span class="gradient-text">Progress.</span>
              </h1>
              <p class="welcome-hero-desc">
                Ascendra is a simple and powerful project and progress tracker designed to help you organize your projects, goals, tasks, time, challenges, achievements and daily progress — all in one place.
              </p>

              <div class="welcome-hero-actions">
                <button class="btn btn-primary btn-lg" id="welcomeHeroOpenBtn">
                  Get Started →
                </button>
                <button class="btn btn-secondary btn-lg" id="welcomeHeroInstallBtn">
                  ⬇️ Install Ascendra
                </button>
              </div>

              <div class="welcome-hero-platforms">
                <span>💻 Windows</span>
                <span>•</span>
                <span>🤖 Android</span>
                <span>•</span>
                <span>📱 iPhone</span>
                <span style="display: block; width: 100%; margin-top: 0.35rem; color: var(--text-secondary); font-size: 0.78rem;">
                  Your progress. Your projects. Your journey.
                </span>
              </div>
            </div>

            <!-- Product Visual Preview Mockup -->
            <div class="welcome-mockup-wrapper">
              <div class="welcome-mockup-frame">
                <div class="welcome-mockup-bar">
                  <div class="mockup-dot red"></div>
                  <div class="mockup-dot yellow"></div>
                  <div class="mockup-dot green"></div>
                  <div style="margin-left: 0.75rem; font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">
                    Ascendra App • 35-Day Data Analyst Journey (Active Project)
                  </div>
                </div>
                <div class="welcome-mockup-screen">
                  <!-- Simulated Live Dashboard Cards -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
                    <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">ACTIVE PROJECT</div>
                      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">Data Analyst</div>
                      <div style="margin-top: 0.5rem; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                        <div style="width: 23%; height: 100%; background: var(--primary-500);"></div>
                      </div>
                    </div>

                    <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">HOURS LOGGED</div>
                      <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.2rem;">8.1 <span style="font-size: 0.75rem; color: var(--text-muted);">/ 35 hrs</span></div>
                      <div style="font-size: 0.7rem; color: var(--success-400); margin-top: 0.25rem;">● On Track</div>
                    </div>

                    <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">CURRENT STREAK</div>
                      <div style="font-size: 1.25rem; font-weight: 800; color: var(--warning-400); margin-top: 0.2rem;">8 <span style="font-size: 0.75rem; color: var(--text-muted);">Days 🔥</span></div>
                      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">Daily consistency</div>
                    </div>

                    <div style="background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">TASKS COMPLETED</div>
                      <div style="font-size: 1.25rem; font-weight: 800; color: var(--success-400); margin-top: 0.2rem;">5 <span style="font-size: 0.75rem; color: var(--text-muted);">/ 10</span></div>
                      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">50% completion</div>
                    </div>
                  </div>

                  <!-- Simulated Recent Daily Log Preview -->
                  <div style="background: var(--bg-surface); padding: 1rem 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <span style="font-size: 1.25rem;">📅</span>
                      <div>
                        <div style="font-size: 0.8rem; font-weight: 700; color: #ffffff;">Day 8: Pandas Series, DataFrames & Indexing</div>
                        <div style="font-size: 0.72rem; color: var(--text-secondary);">Logged 65 mins • Learned DataFrame slicing, boolean masking & groupby</div>
                      </div>
                    </div>
                    <span class="badge badge-success" style="font-size: 0.7rem;">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Why Ascendra Section -->
        <section class="welcome-section" id="welcome-why">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">The Philosophy</span>
              <h2 class="welcome-section-title">Progress is easier when you can see it.</h2>
              <p class="welcome-section-desc">
                We work on projects, learn new skills, set goals and spend hours trying to improve — but it is easy to lose track of how far we've come. Ascendra gives you one place to record the work, measure the progress and reflect on the journey.
              </p>
            </div>

            <div class="why-grid">
              <div class="why-card">
                <div class="why-card-icon">🎯</div>
                <h3 class="why-card-title">PLAN</h3>
                <p class="why-card-desc">
                  Set projects, goals and tasks and know what you're working toward. Break ambitions into structured milestones.
                </p>
              </div>

              <div class="why-card">
                <div class="why-card-icon">⏱</div>
                <h3 class="why-card-title">TRACK</h3>
                <p class="why-card-desc">
                  Record your daily activities, time, challenges and achievements. Capture what you learned and solved each day.
                </p>
              </div>

              <div class="why-card">
                <div class="why-card-icon">📈</div>
                <h3 class="why-card-title">GROW</h3>
                <p class="why-card-desc">
                  Look back at your progress, discover patterns and understand how you're improving with persistent local analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Features Section -->
        <section class="welcome-section" id="welcome-features">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">Comprehensive Toolset</span>
              <h2 class="welcome-section-title">Everything you need to track your journey.</h2>
              <p class="welcome-section-desc">
                Built as a client-first, offline-ready suite. Only the tools you need with zero fluff and zero lock-in.
              </p>
            </div>

            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon-badge">📁</div>
                <h3 class="feature-card-title">Projects</h3>
                <p class="feature-card-desc">Keep multiple projects organized and monitor their overall progress and health status.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">✓</div>
                <h3 class="feature-card-title">Tasks</h3>
                <p class="feature-card-desc">Break projects into manageable tasks, assign priorities, and track completion velocity.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">🎯</div>
                <h3 class="feature-card-title">Goals & Milestones</h3>
                <p class="feature-card-desc">Define concrete targets and measure structured progress toward achieving them.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">📅</div>
                <h3 class="feature-card-title">Daily Progress</h3>
                <p class="feature-card-desc">Record daily activities, time, reflections, breakthroughs, and key learning points.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">⏱</div>
                <h3 class="feature-card-title">Time Tracking</h3>
                <p class="feature-card-desc">Record time invested with live stopwatch timers or manual categorized work logs.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">⚠️</div>
                <h3 class="feature-card-title">Roadblocks & Challenges</h3>
                <p class="feature-card-desc">Document difficulties, roadblocks encountered, root causes, and your solutions.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">💡</div>
                <h3 class="feature-card-title">Breakthroughs & Wins</h3>
                <p class="feature-card-desc">Record important discoveries, key moments of progress, and celebrate your wins.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">📈</div>
                <h3 class="feature-card-title">Analytics</h3>
                <p class="feature-card-desc">Review visual charts for weekly hours, completion velocity, and pace health indicators.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">🗓</div>
                <h3 class="feature-card-title">Calendar</h3>
                <p class="feature-card-desc">Review your historical consistency and daily logged hours across a clean monthly calendar.</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon-badge">💾</div>
                <h3 class="feature-card-title">Data & Backups</h3>
                <p class="feature-card-desc">Manage, export, and restore your data as standard JSON files whenever needed.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. How It Works Section -->
        <section class="welcome-section" id="welcome-how">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">Simple Workflow</span>
              <h2 class="welcome-section-title">Start tracking in minutes.</h2>
              <p class="welcome-section-desc">
                Ascendra is designed for immediate utility without friction or complex onboarding.
              </p>
            </div>

            <div class="how-steps-grid">
              <div class="step-card">
                <span class="step-number">01</span>
                <h3 class="step-title">CREATE A PROJECT</h3>
                <p class="step-desc">Define what you are working toward, whether a learning journey, software build, or skill.</p>
              </div>

              <div class="step-card">
                <span class="step-number">02</span>
                <h3 class="step-title">SET YOUR GOALS</h3>
                <p class="step-desc">Break the project into structured milestones, targeted hours, and actionable tasks.</p>
              </div>

              <div class="step-card">
                <span class="step-number">03</span>
                <h3 class="step-title">RECORD PROGRESS</h3>
                <p class="step-desc">Track your daily study time, reflection, obstacles overcome, and breakthroughs achieved.</p>
              </div>

              <div class="step-card">
                <span class="step-number">04</span>
                <h3 class="step-title">UNDERSTAND JOURNEY</h3>
                <p class="step-desc">Use your historical records and analytics charts to see how your consistent efforts compound.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. 35-Day Data Analyst Journey Section -->
        <section class="welcome-section" id="welcome-journey">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">Real-World Application</span>
              <h2 class="welcome-section-title">Built for journeys like yours.</h2>
              <p class="welcome-section-desc">
                Whether you're learning a new skill, building a project or working toward a personal goal, Ascendra helps you turn your journey into something you can see and measure.
              </p>
            </div>

            <div class="journey-showcase-box">
              <div class="journey-header-row">
                <div>
                  <h3 style="font-size: 1.35rem; font-weight: 800; color: #ffffff; margin-bottom: 0.35rem;">
                    35-Day Data Analyst Journey
                  </h3>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">
                    A real-world example: 35 Days • 35 Target Hours • 1 Hour Daily
                  </div>
                </div>
                <span class="journey-badge">Curriculum & Project Tracking</span>
              </div>

              <!-- Visual Progress Timeline -->
              <div class="timeline-track-wrap">
                <div class="timeline-milestones">
                  <div class="timeline-node active">
                    <div class="timeline-node-circle">1</div>
                    <span class="timeline-node-label">Day 1</span>
                  </div>
                  <div class="timeline-node active">
                    <div class="timeline-node-circle">10</div>
                    <span class="timeline-node-label">Day 10</span>
                  </div>
                  <div class="timeline-node">
                    <div class="timeline-node-circle">20</div>
                    <span class="timeline-node-label">Day 20</span>
                  </div>
                  <div class="timeline-node">
                    <div class="timeline-node-circle">30</div>
                    <span class="timeline-node-label">Day 30</span>
                  </div>
                  <div class="timeline-node">
                    <div class="timeline-node-circle">35</div>
                    <span class="timeline-node-label">Day 35</span>
                  </div>
                </div>
              </div>

              <!-- Metric Badges -->
              <div class="journey-metric-pills">
                <div class="metric-pill-item">
                  <span class="metric-pill-val">8.1 hrs</span>
                  <span class="metric-pill-lbl">Hours Logged</span>
                </div>
                <div class="metric-pill-item">
                  <span class="metric-pill-val">5 / 10</span>
                  <span class="metric-pill-lbl">Tasks Completed</span>
                </div>
                <div class="metric-pill-item">
                  <span class="metric-pill-val">2 / 5</span>
                  <span class="metric-pill-lbl">Goals Achieved</span>
                </div>
                <div class="metric-pill-item">
                  <span class="metric-pill-val">3</span>
                  <span class="metric-pill-lbl">Roadblocks Overcome</span>
                </div>
                <div class="metric-pill-item">
                  <span class="metric-pill-val">5</span>
                  <span class="metric-pill-lbl">Breakthroughs Won</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. Analytics Section -->
        <section class="welcome-section" id="welcome-analytics">
          <div class="welcome-container">
            <div class="analytics-highlight-row">
              <div>
                <span class="welcome-section-tag">Visual Insights</span>
                <h2 class="welcome-section-title" style="text-align: left;">Your journey becomes data.</h2>
                <p class="welcome-section-desc" style="text-align: left;">
                  Every task completed, hour logged, goal achieved and challenge overcome contributes to a bigger picture. Gain visibility into your productivity trends without complicated setups.
                </p>

                <ul class="analytics-points-list">
                  <li class="analytics-point-item">
                    <span class="analytics-point-icon">✓</span>
                    <span><strong>See your progress:</strong> Visual percentage completion against targeted hours.</span>
                  </li>
                  <li class="analytics-point-item">
                    <span class="analytics-point-icon">✓</span>
                    <span><strong>Track time invested:</strong> Categorized distribution of study sessions and project work.</span>
                  </li>
                  <li class="analytics-point-item">
                    <span class="analytics-point-icon">✓</span>
                    <span><strong>Monitor consistency:</strong> Real-time daily streak calculation and activity heatmaps.</span>
                  </li>
                  <li class="analytics-point-item">
                    <span class="analytics-point-icon">✓</span>
                    <span><strong>Understand productivity:</strong> Velocity analysis and milestone completion rates.</span>
                  </li>
                  <li class="analytics-point-item">
                    <span class="analytics-point-icon">✓</span>
                    <span><strong>Review project performance:</strong> Automated pace health indicators (Ahead, On Track, At Risk).</span>
                  </li>
                </ul>
              </div>

              <!-- Graphic Chart Preview -->
              <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">Study Hours Consistency (Last 7 Days)</span>
                  <span class="badge badge-primary" style="font-size: 0.7rem;">Average: 1.1 hrs/day</span>
                </div>
                <!-- SVG Bar Chart Illustration -->
                <svg viewBox="0 0 400 160" width="100%" height="160" style="overflow: visible;">
                  <!-- Grid lines -->
                  <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
                  <line x1="30" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
                  <line x1="30" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
                  <line x1="30" y1="130" x2="380" y2="130" stroke="rgba(255,255,255,0.15)" />
                  <!-- Bars -->
                  <rect x="50" y="45" width="28" height="85" rx="4" fill="#6366f1" />
                  <rect x="100" y="55" width="28" height="75" rx="4" fill="#6366f1" />
                  <rect x="150" y="35" width="28" height="95" rx="4" fill="#38bdf8" />
                  <rect x="200" y="60" width="28" height="70" rx="4" fill="#6366f1" />
                  <rect x="250" y="40" width="28" height="90" rx="4" fill="#6366f1" />
                  <rect x="300" y="50" width="28" height="80" rx="4" fill="#38bdf8" />
                  <rect x="350" y="30" width="28" height="100" rx="4" fill="#10b981" />
                  <!-- Labels -->
                  <text x="64" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Mon</text>
                  <text x="114" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Tue</text>
                  <text x="164" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Wed</text>
                  <text x="214" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Thu</text>
                  <text x="264" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Fri</text>
                  <text x="314" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Sat</text>
                  <text x="364" y="148" fill="#94a3b8" font-size="10" text-anchor="middle">Sun</text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <!-- 8. Offline Section -->
        <section class="welcome-section" id="welcome-offline">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">Privacy & Reliability</span>
              <h2 class="welcome-section-title">Your work. Your data. Your device.</h2>
              <p class="welcome-section-desc">
                Ascendra is designed to support offline use, allowing you to continue tracking your projects and progress even when an active internet connection is unavailable.
              </p>
            </div>

            <div class="offline-grid">
              <div class="offline-card">
                <div class="offline-card-icon">⚡</div>
                <h3 class="offline-card-title">OFFLINE</h3>
                <p class="offline-card-desc">
                  Continue working when an internet connection is unavailable. All logging and viewing operate smoothly without network dependency.
                </p>
              </div>

              <div class="offline-card">
                <div class="offline-card-icon">🔒</div>
                <h3 class="offline-card-title">LOCAL</h3>
                <p class="offline-card-desc">
                  Keep your core project information on your device. Powered by your browser's persistent IndexedDB storage.
                </p>
              </div>

              <div class="offline-card">
                <div class="offline-card-icon">📦</div>
                <h3 class="offline-card-title">PORTABLE</h3>
                <p class="offline-card-desc">
                  Back up and export your information when needed. Full JSON exports ensure you always own 100% of your records.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 9. Installation Section -->
        <section class="welcome-section" id="welcome-install">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">Cross-Platform PWA</span>
              <h2 class="welcome-section-title">Take Ascendra with you.</h2>
              <p class="welcome-section-desc">
                Install Ascendra on your desktop or mobile device for native app performance, standalone window experience, and immediate offline access.
              </p>
            </div>

            <div class="install-platforms-grid">
              <div class="platform-card">
                <div class="platform-icon">💻</div>
                <h3 class="platform-name">WINDOWS / MAC</h3>
                <p class="platform-steps">
                  Open Ascendra in Chrome, Edge or Brave and select the <strong>Install</strong> icon in the address bar.
                </p>
              </div>

              <div class="platform-card">
                <div class="platform-icon">🤖</div>
                <h3 class="platform-name">ANDROID</h3>
                <p class="platform-steps">
                  Open Ascendra in Chrome and tap <strong>Install App</strong> or <strong>Add to Home Screen</strong> from the browser menu.
                </p>
              </div>

              <div class="platform-card">
                <div class="platform-icon">🍏</div>
                <h3 class="platform-name">iPHONE / iPAD</h3>
                <p class="platform-steps">
                  Open Ascendra in Safari, tap the <strong>Share</strong> button (square with arrow), then select <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div style="text-align: center;">
              <button class="btn btn-primary btn-lg" id="welcomeInstallPwaBtn">
                ⬇️ Install Ascendra App
              </button>
            </div>
          </div>
        </section>

        <!-- 10. About the Creator Section -->
        <section class="welcome-section" id="welcome-about">
          <div class="welcome-container">
            <div class="welcome-section-header">
              <span class="welcome-section-tag">The Creator</span>
              <h2 class="welcome-section-title">Built with a purpose.</h2>
            </div>

            <div class="creator-profile-card">
              <div class="creator-avatar">AU</div>
              <h3 class="creator-name">Ajetunmobi Uthman Ayinla</h3>
              <div class="creator-role">Designer & Developer</div>
              <p class="creator-quote">
                "Ascendra started with a simple idea: progress should not disappear once the day is over. It was created as a tool to keep track of what I'm learning, what I'm building, the time I'm investing, the challenges I encounter and the breakthroughs along the way. Ascendra is that tool — built around the idea of turning effort into measurable progress."
              </p>
            </div>
          </div>
        </section>

        <!-- 11. Final Call To Action -->
        <section class="welcome-cta-section">
          <div class="welcome-container welcome-cta-box">
            <h2 class="welcome-cta-title">Your next step starts here.</h2>
            <p class="welcome-cta-desc">
              Start a project. Set a goal. Record your first day. Begin your journey with Ascendra.
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" id="welcomeFinalOpenBtn">
                Open Ascendra →
              </button>
              <button class="btn btn-secondary btn-lg" id="welcomeFinalInstallBtn">
                ⬇️ Install Ascendra
              </button>
            </div>
          </div>
        </section>

        <!-- 12. Footer -->
        <footer class="welcome-footer">
          <div class="welcome-container welcome-footer-inner">
            <div class="welcome-footer-top">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="welcome-logo-box" style="width: 32px; height: 32px;">
                  <img src="./assets/icons/ascendra-logo.png" alt="Ascendra Logo" width="26" height="26" />
                </div>
                <div>
                  <span style="font-weight: 800; font-size: 1.1rem; color: #ffffff;">ASCENDRA</span>
                  <span style="display: block; font-size: 0.68rem; color: var(--primary-400); font-weight: 600;">Track. Build. Grow.</span>
                </div>
              </div>

              <div class="welcome-footer-links">
                <a href="#welcome-hero">Home</a>
                <a href="#welcome-features">Features</a>
                <a href="#welcome-how">How It Works</a>
                <a href="#welcome-about">About</a>
                <a href="#welcome-install">Install</a>
                <a href="#dashboard" id="welcomeFooterOpenLink" style="color: var(--primary-400); font-weight: 700;">Open Ascendra →</a>
              </div>
            </div>

            <div class="welcome-footer-bottom">
              <div>
                © 2026 Ajetunmobi Uthman Ayinla. All Rights Reserved.
              </div>
              <div>
                Feedback: <a href="mailto:uthman.ajetunmobi@fuhsi.edu.ng">uthman.ajetunmobi@fuhsi.edu.ng</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Hook events
    this.setupEvents(container, onOpenApp);
  }

  static setupEvents(container, onOpenApp) {
    // Open Ascendra actions
    const triggerOpen = (e) => {
      e.preventDefault();
      if (typeof onOpenApp === 'function') {
        onOpenApp();
      } else {
        window.location.hash = '#dashboard';
      }
    };

    const openBtns = [
      container.querySelector('#welcomeHeaderOpenBtn'),
      container.querySelector('#welcomeHeroOpenBtn'),
      container.querySelector('#welcomeFinalOpenBtn'),
      container.querySelector('#welcomeFooterOpenLink')
    ];

    openBtns.forEach((btn) => {
      if (btn) btn.addEventListener('click', triggerOpen);
    });

    // PWA Install Triggers
    const triggerInstall = (e) => {
      e.preventDefault();

      // Check if already running standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (isStandalone) {
        openModal({
          title: 'Ascendra is Installed',
          bodyHtml: `
            <div style="text-align: center; padding: 0.75rem 0;">
              <div style="font-size: 2.75rem; margin-bottom: 0.75rem;">🎉</div>
              <h4 style="color: var(--text-primary); font-weight: 800; font-size: 1.15rem; margin-bottom: 0.5rem;">
                Ascendra is already installed on your device!
              </h4>
              <p style="color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: 1rem;">
                You are currently running the installed Progressive Web App with full offline IndexedDB data storage.
              </p>
            </div>
          `,
          confirmText: 'Open Dashboard',
          confirmClass: 'btn-primary',
          onConfirm: () => {
            window.location.hash = '#dashboard';
          }
        });
        return;
      }

      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
          }
          window.deferredPrompt = null;
        }).catch((err) => {
          console.warn('[PWA] Prompt error:', err);
          this.openInstallModal();
        });
      } else {
        // Show Platform Installation Guide Modal
        this.openInstallModal();
      }
    };

    const installBtns = [
      container.querySelector('#welcomeHeroInstallBtn'),
      container.querySelector('#welcomeInstallPwaBtn'),
      container.querySelector('#welcomeFinalInstallBtn')
    ];

    installBtns.forEach((btn) => {
      if (btn) btn.addEventListener('click', triggerInstall);
    });

    // Mobile Navigation Hamburger
    const mobileToggle = container.querySelector('#welcomeMobileToggle');
    const navMenu = container.querySelector('#welcomeNav');
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });

      // Close menu when clicking nav links
      navMenu.querySelectorAll('.welcome-nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }

    // Smooth scrolling for internal anchor links
    container.querySelectorAll('a[href^="#welcome"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#welcome') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const targetEl = container.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  static openInstallModal() {
    openModal({
      title: 'Install Ascendra App',
      bodyHtml: `
        <div style="line-height: 1.6; font-size: var(--font-size-sm); color: var(--text-secondary);">
          <p style="margin-bottom: 1.25rem;">
            Ascendra installs directly as a lightweight, offline-capable Progressive Web App (PWA) with zero App Store or Play Store downloads needed:
          </p>
          
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.25rem;">
            <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--primary-500);">
              <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">💻 Windows & Mac (Chrome, Edge, Brave)</strong>
              Look at the right side of your browser's address bar and click the <strong>Install</strong> icon (an icon with a computer or plus symbol), or open the browser menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong>Install Ascendra...</strong>.
            </div>

            <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent-cyan);">
              <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">🤖 Android (Chrome)</strong>
              Tap the browser menu (<strong>⋮</strong> in top right) and select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
            </div>

            <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--warning-400);">
              <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">🍏 iPhone & iPad (Safari)</strong>
              Tap the <strong>Share</strong> button at the bottom of the screen (square icon with an arrow pointing up), scroll down and tap <strong>Add to Home Screen</strong>.
            </div>
          </div>

          <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.78rem; color: var(--text-muted);">
            💡 <em>Tip: Once installed, Ascendra opens in its own window and operates without an internet connection.</em>
          </div>
        </div>
      `,
      confirmText: 'Got It',
      confirmClass: 'btn-primary'
    });
  }
}
