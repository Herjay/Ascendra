/**
 * Data Journey - Client-Side Hash Router
 */

export class Router {
  constructor(routes, defaultRoute = 'welcome') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  navigate(route) {
    if (window.location.hash === `#${route}`) {
      this.handleRoute();
    } else {
      window.location.hash = `#${route}`;
    }
  }

  handleRoute() {
    const rawHash = window.location.hash.slice(1);
    let route = rawHash || this.defaultRoute;
    let anchor = null;

    // Support sub-anchors on landing/welcome page (e.g. welcome-features, welcome-install)
    if (route.startsWith('welcome-')) {
      anchor = route;
      route = 'welcome';
    }

    if (this.routes[route]) {
      // If already on welcome view and just scrolling to anchor
      if (this.currentRoute === route && anchor) {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      this.currentRoute = route;
      this.routes[route]();
      this.updateActiveNavLink(route);

      if (anchor) {
        setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    } else {
      window.location.hash = `#${this.defaultRoute}`;
    }
  }

  updateActiveNavLink(route) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${route}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Top Header Page Title
    const titleMap = {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      projects: 'Projects',
      daily: 'Daily Progress',
      tasks: 'Tasks',
      goals: 'Goals & Milestones',
      issues: 'Challenges & Breakthroughs',
      timetracker: 'Time Tracking',
      calendar: 'Calendar',
      analytics: 'Analytics',
      backup: 'Data & Backups'
    };

    const headerTitle = document.getElementById('currentPageTitle');
    if (headerTitle && titleMap[route]) {
      headerTitle.textContent = titleMap[route];
    }
  }
}
