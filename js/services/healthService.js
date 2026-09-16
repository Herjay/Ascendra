/**
 * Data Journey - Project Health Calculation Service
 * Section 7 & 18 of Specification.
 */

export class HealthService {
  /**
   * Computes schedule health for a given project and its logged minutes
   * @param {Object} project - Project object
   * @param {number} totalLoggedMinutes - Total logged minutes across daily records
   * @param {Object} thresholds - Configurable thresholds (defaults: ahead >= 1.10, atRisk < 0.90, behind < 0.75)
   */
  static calculateHealth(project, totalLoggedMinutes = 0, thresholds = {}) {
    const aheadThreshold = thresholds.paceAheadThreshold || 1.10;
    const atRiskThreshold = thresholds.paceAtRiskThreshold || 0.90;
    const behindThreshold = thresholds.paceBehindThreshold || 0.75;

    // Completed projects
    if (project.status === 'Completed') {
      return {
        status: 'Completed',
        badgeClass: 'health-ahead',
        label: 'Completed',
        ratio: 1.0,
        explanation: 'Project successfully completed.'
      };
    }

    const totalTargetHours = parseFloat(project.totalTargetHours || project.courseDurationHours || 0);
    const plannedDays = parseInt(project.plannedDurationDays || 0, 10);
    const actualHours = totalLoggedMinutes / 60;

    // If no schedule parameters are specified, fallback to task/time ratio
    if (!totalTargetHours || !plannedDays || !project.startDate) {
      return {
        status: 'On Track',
        badgeClass: 'health-ontrack',
        label: 'Active',
        ratio: 1.0,
        explanation: 'Flexible schedule (no strict deadline target).'
      };
    }

    // Calculate days elapsed since start date
    const start = new Date(project.startDate);
    const today = new Date();
    const elapsedDays = Math.max(1, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));

    // Expected target hours by today
    const expectedProgressHours = (Math.min(elapsedDays, plannedDays) / plannedDays) * totalTargetHours;

    // Pace Ratio: Actual / Expected
    const paceRatio = expectedProgressHours > 0 ? (actualHours / expectedProgressHours) : 1.0;

    if (paceRatio >= aheadThreshold) {
      return {
        status: 'Ahead',
        badgeClass: 'health-ahead',
        label: 'Ahead of Schedule',
        ratio: paceRatio,
        explanation: `Progress is ${(paceRatio * 100).toFixed(0)}% of expected pace (${actualHours.toFixed(1)}h logged vs ${expectedProgressHours.toFixed(1)}h expected).`
      };
    } else if (paceRatio >= atRiskThreshold) {
      return {
        status: 'On Track',
        badgeClass: 'health-ontrack',
        label: 'On Track',
        ratio: paceRatio,
        explanation: `Progress is consistent with schedule (${actualHours.toFixed(1)}h logged vs ${expectedProgressHours.toFixed(1)}h expected).`
      };
    } else if (paceRatio >= behindThreshold) {
      return {
        status: 'At Risk',
        badgeClass: 'health-atrisk',
        label: 'At Risk',
        ratio: paceRatio,
        explanation: `Slightly behind schedule (${actualHours.toFixed(1)}h logged vs ${expectedProgressHours.toFixed(1)}h expected).`
      };
    } else {
      return {
        status: 'Behind',
        badgeClass: 'health-behind',
        label: 'Behind Schedule',
        ratio: paceRatio,
        explanation: `Significantly behind target pace (${actualHours.toFixed(1)}h logged vs ${expectedProgressHours.toFixed(1)}h expected).`
      };
    }
  }
}
