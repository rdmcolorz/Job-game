// ============================================
// GAMIFICATION ENGINE
// Core XP, leveling, and achievement logic
// ============================================

// --- XP REWARDS ---
// Each action in the app earns XP. Values are tuned for engagement:
// - Small actions (login) give small XP to reward consistency
// - Big actions (applying) give larger XP to reward meaningful progress
export const XP_REWARDS = {
  PROFILE_SECTION: 50,    // Completing a profile section (name, skills, etc.)
  APPLY_JOB: 100,         // Submitting a job application
  DAILY_LOGIN: 25,        // Logging in each day
  WEEKLY_STREAK_BONUS: 100, // Bonus for 7-day streak
  FIRST_APP_OF_DAY: 50,   // Bonus for first application each day
};

// --- LEVEL SYSTEM ---
// XP required per level scales by 1.5x:
//   Level 1→2: 500 XP
//   Level 2→3: 750 XP
//   Level 3→4: 1125 XP
// This creates a satisfying early progression that gradually slows.
const BASE_XP_PER_LEVEL = 500;
const LEVEL_SCALE_FACTOR = 1.5;

export function getXPForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_SCALE_FACTOR, level - 2));
}

// Calculate total XP needed to reach a given level from Level 1
export function getTotalXPForLevel(level) {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

// Given total XP, calculate the current level and progress within that level
export function calculateLevel(totalXP) {
  let level = 1;
  let xpRemaining = totalXP;

  while (true) {
    const xpNeeded = getXPForLevel(level + 1);
    if (xpRemaining < xpNeeded) {
      return {
        level,
        currentXP: xpRemaining,     // XP into current level
        xpToNext: xpNeeded,          // XP needed for next level
        progress: xpNeeded > 0 ? xpRemaining / xpNeeded : 0,
      };
    }
    xpRemaining -= xpNeeded;
    level++;
  }
}

// --- LEVEL TITLES ---
// Fun titles that make leveling up feel rewarding
const LEVEL_TITLES = [
  'Newcomer',        // 1
  'Job Seeker',      // 2
  'Applicant',       // 3
  'Go-Getter',       // 4
  'Career Explorer',  // 5
  'Rising Star',     // 6
  'Job Hunter',      // 7
  'Career Builder',  // 8
  'Opportunity Finder', // 9
  'Career Champion', // 10+
];

export function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

// --- ACHIEVEMENTS ---
// Each achievement has: id, name, description, icon, and a check function.
// Achievements unlock based on user stats and provide a sense of accomplishment.
export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Submit your first job application',
    icon: '🚀',
    check: (stats) => stats.totalApplications >= 1,
  },
  {
    id: 'go_getter',
    name: 'Go-Getter',
    description: 'Submit 5 job applications',
    icon: '⚡',
    check: (stats) => stats.totalApplications >= 5,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Submit 15 job applications',
    icon: '🔥',
    check: (stats) => stats.totalApplications >= 15,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: '7-day login streak',
    icon: '🏆',
    check: (stats) => stats.maxStreak >= 7,
  },
  {
    id: 'profile_pro',
    name: 'Profile Pro',
    description: '100% profile completion',
    icon: '⭐',
    check: (stats) => stats.profileCompletion >= 100,
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: '🌟',
    check: (stats) => stats.level >= 5,
  },
  {
    id: 'interview_ready',
    name: 'Interview Ready',
    description: 'Get your first interview',
    icon: '🎯',
    check: (stats) => stats.interviews >= 1,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Apply to 3 jobs in one day',
    icon: '🐦',
    check: (stats) => stats.applicationsToday >= 3,
  },
];

// Check which achievements are newly unlocked
export function checkAchievements(stats, unlockedIds) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.check(stats)) {
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

// --- STREAK LOGIC ---
// Streaks reward daily engagement. A streak breaks if the user
// misses a calendar day.
export function calculateStreak(loginDates) {
  if (!loginDates || loginDates.length === 0) return { current: 0, max: 0 };

  const sorted = [...loginDates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak: must include today or yesterday
  let current = 0;
  if (sorted[0] === today || sorted[0] === yesterday) {
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffDays = (prev - curr) / 86400000;
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Max streak across all history
  let max = 1;
  let tempStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev - curr) / 86400000;
    if (diffDays === 1) {
      tempStreak++;
      max = Math.max(max, tempStreak);
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }

  return { current, max: Math.max(max, current) };
}

// --- PROFILE COMPLETION ---
// Each section is worth equal weight. Returns 0-100 percentage.
export function calculateProfileCompletion(profile) {
  if (!profile) return 0;

  const sections = [
    { name: 'name', check: () => !!profile.name?.trim() },
    { name: 'email', check: () => !!profile.email?.trim() },
    { name: 'skills', check: () => profile.skills?.length > 0 },
    { name: 'experience', check: () => !!profile.experienceLevel },
    { name: 'location', check: () => !!profile.preferredLocation?.trim() },
    { name: 'jobType', check: () => !!profile.preferredJobType },
    { name: 'salaryRange', check: () => !!profile.salaryRange?.min },
    { name: 'bio', check: () => !!profile.bio?.trim() },
  ];

  const completed = sections.filter(s => s.check()).length;
  return Math.round((completed / sections.length) * 100);
}

// Return which sections are complete/incomplete for the checklist UI
export function getProfileSections(profile) {
  if (!profile) return [];

  return [
    { name: 'Full Name', key: 'name', complete: !!profile.name?.trim() },
    { name: 'Email', key: 'email', complete: !!profile.email?.trim() },
    { name: 'Skills', key: 'skills', complete: profile.skills?.length > 0 },
    { name: 'Experience Level', key: 'experience', complete: !!profile.experienceLevel },
    { name: 'Preferred Location', key: 'location', complete: !!profile.preferredLocation?.trim() },
    { name: 'Job Type Preference', key: 'jobType', complete: !!profile.preferredJobType },
    { name: 'Salary Range', key: 'salary', complete: !!profile.salaryRange?.min },
    { name: 'Bio', key: 'bio', complete: !!profile.bio?.trim() },
  ];
}
