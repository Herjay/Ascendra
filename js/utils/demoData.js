/**
 * Data Journey - Rich Demo Dataset for "35-Day Data Analyst Journey"
 * Fulfills Section 3 & 16 of the Specification.
 */

import { generateUUID } from './uuid.js';

export function getDemoDataset() {
  const projectId = 'demo-project-35day-data-analyst';
  const now = new Date();
  
  // Calculate relative dates for the last 8 days
  const getDateDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const project = {
    id: projectId,
    name: '35-Day Data Analyst Journey',
    description: 'A 35-hour structured curriculum covering Python for Data Science, SQL, Pandas, Tableau, and a Capstone Portfolio Project.',
    type: 'Learning',
    status: 'In Progress',
    priority: 'High',
    courseDurationHours: 35,
    plannedDurationDays: 35,
    dailyTargetHours: 1,
    totalTargetHours: 35,
    startDate: getDateDaysAgo(8),
    targetDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 27);
      return d.toISOString().split('T')[0];
    })(),
    isDemo: true,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  const dailyRecords = [
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(8),
      dayNumber: 1,
      plannedMinutes: 60,
      actualMinutes: 65,
      sectionWorkedOn: 'Module 1: Environment Setup & Python Syntax',
      dailyGoal: 'Setup JupyterLab, master basic variables and control flow',
      whatILearned: 'List comprehensions, dictionary iteration, and virtual environment isolation.',
      breakthrough: 'Got comfortable with Jupyter notebook shortcuts and markdown formatting.',
      challenge: 'Understanding mutable vs immutable object references in Python lists.',
      status: 'Completed',
      notes: 'Installed conda and verified packages numpy, pandas, matplotlib.',
      isDemo: true,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(7),
      dayNumber: 2,
      plannedMinutes: 60,
      actualMinutes: 70,
      sectionWorkedOn: 'Module 2: NumPy Arrays & Vectorization',
      dailyGoal: 'Complete NumPy exercises and array indexing challenges',
      whatILearned: 'Array broadcasting, boolean masking, and memory efficiency of contiguous memory.',
      breakthrough: 'Discovered that vectorized operations run ~50x faster than standard python for-loops!',
      challenge: 'Multi-dimensional array slicing syntax syntax with ellipses.',
      status: 'Completed',
      notes: 'Completed all 15 NumPy indexing drills.',
      isDemo: true,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(6),
      dayNumber: 3,
      plannedMinutes: 60,
      actualMinutes: 60,
      sectionWorkedOn: 'Module 3: Pandas Series & DataFrames',
      dailyGoal: 'Import CSV, inspect schema, handle missing values',
      whatILearned: '.loc vs .iloc indexing, df.info(), and df.describe() distribution analysis.',
      breakthrough: 'Understood chain indexing pitfalls and why df.copy() prevents SettingWithCopyWarning.',
      challenge: 'Handling datetime parsing for irregular European timestamp strings.',
      status: 'Completed',
      notes: 'Used pd.to_datetime with format="%d/%m/%Y".',
      isDemo: true,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(5),
      dayNumber: 4,
      plannedMinutes: 60,
      actualMinutes: 75,
      sectionWorkedOn: 'Module 4: GroupBy, Aggregations & Pivot Tables',
      dailyGoal: 'Aggregate customer transaction metrics by region and cohort',
      whatILearned: 'Multiple aggregations with .agg({"sales": "sum", "orders": "count"}), reset_index().',
      breakthrough: 'Pivot tables in pandas match Excel pivot tables 1-to-1 with much higher scalability.',
      challenge: 'Understanding hierarchical MultiIndex columns after groupby aggregations.',
      status: 'Completed',
      notes: 'Flattened MultiIndex with list comprehension.',
      isDemo: true,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateAgo(4),
      dayNumber: 5,
      plannedMinutes: 60,
      actualMinutes: 60,
      sectionWorkedOn: 'Module 5: SQL Basics & Filtering',
      dailyGoal: 'Write SELECT, WHERE, LIKE, ORDER BY queries on Chinook Database',
      whatILearned: 'WHERE vs HAVING clauses, NULL handling with COALESCE and IS NULL.',
      breakthrough: 'Realized SQL query execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.',
      challenge: 'Differences between dialect syntax for date extraction.',
      status: 'Completed',
      notes: 'Practiced 20 LeetCode Easy SQL problems.',
      isDemo: true,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(3),
      dayNumber: 6,
      plannedMinutes: 60,
      actualMinutes: 80,
      sectionWorkedOn: 'Module 6: SQL Multi-Table Joins & CTEs',
      dailyGoal: 'Master INNER, LEFT, FULL OUTER joins and Common Table Expressions',
      whatILearned: 'Writing readable modular queries using WITH cte AS (...) blocks.',
      breakthrough: 'CTEs make nested subqueries so much more readable and maintainable.',
      challenge: 'Duplicate rows caused by one-to-many relationship join Cartesian explosions.',
      status: 'Completed',
      notes: 'Solved 5 intermediate business analytics queries.',
      isDemo: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(2),
      dayNumber: 7,
      plannedMinutes: 60,
      actualMinutes: 65,
      sectionWorkedOn: 'Module 7: SQL Window Functions (OVER, PARTITION BY)',
      dailyGoal: 'Compute running totals, moving averages, and rankings (ROW_NUMBER, RANK, DENSE_RANK)',
      whatILearned: 'ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) for top-N analysis.',
      breakthrough: 'Window functions preserve individual row granularity while computing aggregations!',
      challenge: 'Understanding the difference between RANK and DENSE_RANK when handling ties.',
      status: 'Completed',
      notes: 'Wrote a 7-day rolling revenue window query.',
      isDemo: true,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      date: getDateDaysAgo(1),
      dayNumber: 8,
      plannedMinutes: 60,
      actualMinutes: 70,
      sectionWorkedOn: 'Module 8: Exploratory Data Visualization with Seaborn',
      dailyGoal: 'Create distribution plots, pairplots, and correlation heatmaps',
      whatILearned: 'Seaborn facet grids, palette styling, and styling matplotlib figure canvases.',
      breakthrough: 'Visualizing skewness with boxenplot and KDE overlays.',
      challenge: 'Matplotlib tick label overlapping on long date axes.',
      status: 'Completed',
      notes: 'plt.xticks(rotation=45, ha="right") solved the label collision.',
      isDemo: true,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  function getDateAgo(d) {
    return getDateDaysAgo(d);
  }

  const tasks = [
    {
      id: generateUUID(),
      projectId,
      title: 'Complete 30 SQL LeetCode challenges',
      description: 'Focus on window functions and aggregations',
      status: 'In Progress',
      priority: 'High',
      dueDate: getDateDaysAgo(-5),
      estimatedMinutes: 300,
      actualMinutes: 180,
      category: 'Practice',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'Setup GitHub portfolio repository for data projects',
      description: 'Include clean README with architecture diagrams and sample datasets',
      status: 'Completed',
      priority: 'Medium',
      dueDate: getDateDaysAgo(2),
      estimatedMinutes: 60,
      actualMinutes: 50,
      category: 'Portfolio',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'Clean eCommerce customer churn raw dataset',
      description: 'Handle missing values, encode categoricals, detect outliers with IQR',
      status: 'In Progress',
      priority: 'High',
      dueDate: getDateDaysAgo(-2),
      estimatedMinutes: 120,
      actualMinutes: 70,
      category: 'Project',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'Build interactive Streamlit or Power BI dashboard',
      description: 'Display churn drivers, customer lifetime value, and cohort retention',
      status: 'Todo',
      priority: 'High',
      dueDate: getDateDaysAgo(-14),
      estimatedMinutes: 240,
      actualMinutes: 0,
      category: 'Project',
      isDemo: true,
      createdAt: new Date().toISOString()
    }
  ];

  const goals = [
    {
      id: generateUUID(),
      projectId,
      title: 'Master SQL Window Functions & Aggregations',
      description: 'Be able to write production-grade analytical queries without looking up syntax.',
      targetDate: getDateDaysAgo(-10),
      priority: 'High',
      status: 'Completed',
      progress: 100,
      notes: 'Completed Modules 5, 6, and 7 drills.',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'Publish End-to-End Analytics Case Study to Portfolio',
      description: 'A comprehensive report with EDA, SQL transformation pipeline, and executive summary.',
      targetDate: project.targetDate,
      priority: 'High',
      status: 'In Progress',
      progress: 35,
      notes: 'Dataset acquired, preliminary cleaning started.',
      isDemo: true,
      createdAt: new Date().toISOString()
    }
  ];

  const issues = [
    {
      id: generateUUID(),
      projectId,
      title: 'Cartesian product row explosion during multi-table join',
      description: 'Joining order items directly with payments caused duplicate order revenue sums.',
      severity: 'High',
      status: 'Resolved',
      date: getDateDaysAgo(3),
      possibleSolution: 'Pre-aggregate payments at the order_id level before joining with orders.',
      actualSolution: 'Created a CTE to calculate SUM(amount) GROUP BY order_id, then joined to the orders table.',
      resolutionDate: getDateDaysAgo(3),
      notes: 'Crucial lesson: Never join two 1-to-many child tables directly without aggregation.',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'SettingWithCopyWarning during chained Pandas assignment',
      description: 'Modifying a filtered slice triggered warning about setting value on copy vs view.',
      severity: 'Medium',
      status: 'Resolved',
      date: getDateDaysAgo(6),
      possibleSolution: 'Use .loc or explicit .copy().',
      actualSolution: 'Explicitly called df_subset = df[df["region"] == "North"].copy().',
      resolutionDate: getDateDaysAgo(6),
      notes: 'Cleaned up all warning messages across notebook.',
      isDemo: true,
      createdAt: new Date().toISOString()
    }
  ];

  const breakthroughs = [
    {
      id: generateUUID(),
      projectId,
      title: 'Grasped SQL Window Execution & Partitioning',
      description: 'Realized that window functions calculate across partitions without collapsing rows like GROUP BY does.',
      date: getDateDaysAgo(2),
      category: 'Technical',
      importance: 'High',
      notes: 'Unlocks moving averages, running totals, and ranking queries instantly.',
      isDemo: true,
      createdAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      projectId,
      title: 'NumPy Vectorization Speedup',
      description: 'Replaced a 10,000 iteration for-loop with a single vector expression; execution dropped from 1.4s to 4ms.',
      date: getDateDaysAgo(7),
      category: 'Efficiency',
      importance: 'High',
      notes: 'Always seek vectorized alternatives when working with numerical matrices.',
      isDemo: true,
      createdAt: new Date().toISOString()
    }
  ];

  const timeEntries = dailyRecords.map((rec) => ({
    id: generateUUID(),
    projectId,
    date: rec.date,
    durationMinutes: rec.actualMinutes,
    description: `Day ${rec.dayNumber}: ${rec.sectionWorkedOn}`,
    category: 'Study Session',
    isDemo: true,
    createdAt: rec.createdAt
  }));

  const notes = [
    {
      id: generateUUID(),
      projectId,
      title: 'Pandas Quick Reference & Cheatsheet',
      content: 'Useful methods:\n- df.memory_usage(deep=True)\n- pd.qcut() vs pd.cut()\n- df.select_dtypes(include=["number"])\n- df.melt() for unpivoting wide data into long format.',
      isDemo: true,
      createdAt: new Date().toISOString()
    }
  ];

  return {
    projects: [project],
    dailyProgress: dailyRecords,
    tasks,
    goals,
    issues,
    breakthroughs,
    timeEntries,
    notes,
    settings: [
      { key: 'activeProjectId', value: projectId },
      { key: 'theme', value: 'dark' },
      { key: 'paceAheadThreshold', value: 1.10 },
      { key: 'paceAtRiskThreshold', value: 0.90 }
    ]
  };
}
