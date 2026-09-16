/**
 * Data Journey - Streak & Activity Tracking Service
 * Sections 5.1, 6 & 17 of Specification.
 */

export class StreakService {
  /**
   * Calculates current streak and longest streak from daily progress and time entries
   * @param {Array} dailyRecords - Array of dailyProgress items
   */
  static calculateStreaks(dailyRecords = []) {
    if (!dailyRecords || dailyRecords.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDays: 0, dateMap: {} };
    }

    // Filter unique dates with logged time > 0 or status === 'Completed'
    const activeDateSet = new Set();
    const dateMinutesMap = {};

    dailyRecords.forEach((rec) => {
      const minutes = parseInt(rec.actualMinutes || 0, 10);
      if (minutes > 0 || rec.status === 'Completed') {
        activeDateSet.add(rec.date);
        dateMinutesMap[rec.date] = (dateMinutesMap[rec.date] || 0) + minutes;
      }
    });

    const activeDays = activeDateSet.size;
    if (activeDays === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDays: 0, dateMap: dateMinutesMap };
    }

    // Sort active dates ascending
    const sortedDates = Array.from(activeDateSet).sort();

    // Compute longest streak
    let longestStreak = 1;
    let currentSequence = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentSequence++;
        if (currentSequence > longestStreak) {
          longestStreak = currentSequence;
        }
      } else if (diffDays > 1) {
        currentSequence = 1;
      }
    }

    // Compute current streak (working backwards from today or yesterday)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yestStr = yesterday.toISOString().split('T')[0];

    // Current streak is active if user logged today or yesterday
    let checkDate = activeDateSet.has(todayStr) ? new Date(today) : (activeDateSet.has(yestStr) ? new Date(yesterday) : null);

    if (checkDate) {
      currentStreak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevDateStr = checkDate.toISOString().split('T')[0];
        if (activeDateSet.has(prevDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      activeDays,
      dateMap: dateMinutesMap
    };
  }
}
