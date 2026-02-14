import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateLevel,
  calculateProfileCompletion,
  calculateStreak,
  checkAchievements,
  XP_REWARDS,
} from '../utils/gamification';

// Central Zustand store with localStorage persistence.
// All user state, gamification, and application tracking lives here.
const useStore = create(
  persist(
    (set, get) => ({
      // --- AUTH STATE ---
      isAuthenticated: false,
      user: null, // { email, password (hashed in real app) }

      // --- PROFILE ---
      profile: {
        name: '',
        email: '',
        skills: [],
        experienceLevel: '',
        preferredLocation: '',
        preferredJobType: '',
        salaryRange: { min: null, max: null },
        bio: '',
      },

      // --- GAMIFICATION ---
      totalXP: 0,
      achievements: [],      // Array of unlocked achievement IDs
      loginDates: [],         // Array of date strings (YYYY-MM-DD)
      applicationsToday: 0,
      lastApplicationDate: null,
      xpHistory: [],          // { amount, reason, timestamp }

      // --- APPLICATIONS ---
      applications: [],       // { jobId, status, appliedAt, updatedAt }
      // Snapshots of jobs at time of application, keyed by jobId.
      // This ensures ApplicationsPage can display job details even if
      // the job disappears from the live API feed.
      jobSnapshots: {},

      // --- API SETTINGS ---
      apiSettings: {
        adzunaAppId: '',
        adzunaAppKey: '',
      },

      // --- UI STATE ---
      notifications: [],      // { id, type, message, timestamp }
      showLevelUp: false,
      levelUpData: null,

      // ============================
      // AUTH ACTIONS
      // ============================
      signup: (email, password, name) => {
        set({
          isAuthenticated: true,
          user: { email, password },
          profile: { ...get().profile, email, name },
        });
        // Award XP for setting up name and email
        get().addXP(XP_REWARDS.PROFILE_SECTION, 'Signed up - name added');
        get().addXP(XP_REWARDS.PROFILE_SECTION, 'Signed up - email added');
        get().recordLogin();
      },

      login: (email, password) => {
        const state = get();
        if (state.user?.email === email && state.user?.password === password) {
          set({ isAuthenticated: true });
          get().recordLogin();
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      // ============================
      // PROFILE ACTIONS
      // ============================
      updateProfile: (updates) => {
        const prevProfile = get().profile;
        const prevCompletion = calculateProfileCompletion(prevProfile);

        const newProfile = { ...prevProfile, ...updates };
        set({ profile: newProfile });

        // Award XP for newly completed sections
        const newCompletion = calculateProfileCompletion(newProfile);
        const sectionsCompleted = Math.floor(newCompletion / 12.5) - Math.floor(prevCompletion / 12.5);
        if (sectionsCompleted > 0) {
          for (let i = 0; i < sectionsCompleted; i++) {
            get().addXP(XP_REWARDS.PROFILE_SECTION, 'Profile section completed');
          }
        }

        get().checkForAchievements();
      },

      // ============================
      // GAMIFICATION ACTIONS
      // ============================
      addXP: (amount, reason) => {
        const prevLevel = calculateLevel(get().totalXP);
        const newTotalXP = get().totalXP + amount;
        const newLevel = calculateLevel(newTotalXP);

        const entry = {
          amount,
          reason,
          timestamp: new Date().toISOString(),
        };

        set({
          totalXP: newTotalXP,
          xpHistory: [entry, ...get().xpHistory].slice(0, 50), // Keep last 50
        });

        // Trigger level-up celebration if level increased
        if (newLevel.level > prevLevel.level) {
          set({
            showLevelUp: true,
            levelUpData: {
              oldLevel: prevLevel.level,
              newLevel: newLevel.level,
            },
          });
        }

        get().addNotification('xp', `+${amount} XP: ${reason}`);
        get().checkForAchievements();
      },

      dismissLevelUp: () => {
        set({ showLevelUp: false, levelUpData: null });
      },

      recordLogin: () => {
        const today = new Date().toISOString().split('T')[0];
        const loginDates = get().loginDates;

        if (!loginDates.includes(today)) {
          const newDates = [...loginDates, today];
          set({ loginDates: newDates, applicationsToday: 0 });

          // Daily login XP
          get().addXP(XP_REWARDS.DAILY_LOGIN, 'Daily login');

          // Check for 7-day streak bonus
          const streak = calculateStreak(newDates);
          if (streak.current > 0 && streak.current % 7 === 0) {
            get().addXP(XP_REWARDS.WEEKLY_STREAK_BONUS, `${streak.current}-day streak bonus!`);
          }
        }
      },

      // ============================
      // APPLICATION ACTIONS
      // ============================
      // jobData: the full job object to snapshot for later display
      applyToJob: (jobId, jobData) => {
        const state = get();

        // Prevent duplicate applications
        if (state.applications.find(a => a.jobId === jobId)) {
          return false;
        }

        const today = new Date().toISOString().split('T')[0];
        const isFirstToday = state.lastApplicationDate !== today;

        const newApp = {
          jobId,
          status: 'applied',
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newAppsToday = isFirstToday ? 1 : state.applicationsToday + 1;

        // Store a snapshot of the job so ApplicationsPage can always
        // display its details, even if the API stops returning it.
        const newSnapshots = { ...state.jobSnapshots };
        if (jobData) {
          newSnapshots[jobId] = jobData;
        }

        set({
          applications: [...state.applications, newApp],
          applicationsToday: newAppsToday,
          lastApplicationDate: today,
          jobSnapshots: newSnapshots,
        });

        // Base XP for applying
        get().addXP(XP_REWARDS.APPLY_JOB, 'Applied to a job');

        // Bonus for first application of the day
        if (isFirstToday) {
          get().addXP(XP_REWARDS.FIRST_APP_OF_DAY, 'First application of the day bonus');
        }

        get().checkForAchievements();
        return true;
      },

      updateApplicationStatus: (jobId, newStatus) => {
        set({
          applications: get().applications.map(app =>
            app.jobId === jobId
              ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
              : app
          ),
        });
        get().checkForAchievements();
      },

      // ============================
      // ACHIEVEMENT CHECKING
      // ============================
      checkForAchievements: () => {
        const state = get();
        const levelInfo = calculateLevel(state.totalXP);
        const streak = calculateStreak(state.loginDates);

        const stats = {
          totalApplications: state.applications.length,
          maxStreak: streak.max,
          profileCompletion: calculateProfileCompletion(state.profile),
          level: levelInfo.level,
          interviews: state.applications.filter(a => a.status === 'interview').length,
          applicationsToday: state.applicationsToday,
        };

        const newAchievements = checkAchievements(stats, state.achievements);

        if (newAchievements.length > 0) {
          const newIds = newAchievements.map(a => a.id);
          set({
            achievements: [...state.achievements, ...newIds],
          });

          newAchievements.forEach(a => {
            get().addNotification('achievement', `Achievement unlocked: ${a.icon} ${a.name}`);
          });
        }
      },

      // ============================
      // NOTIFICATIONS
      // ============================
      addNotification: (type, message) => {
        const notification = {
          id: Date.now() + Math.random(),
          type,
          message,
          timestamp: new Date().toISOString(),
        };
        set({
          notifications: [notification, ...get().notifications].slice(0, 20),
        });
      },

      clearNotification: (id) => {
        set({
          notifications: get().notifications.filter(n => n.id !== id),
        });
      },

      // ============================
      // API SETTINGS ACTIONS
      // ============================
      updateApiSettings: (updates) => {
        set({ apiSettings: { ...get().apiSettings, ...updates } });
      },

      // ============================
      // COMPUTED HELPERS
      // ============================
      getStats: () => {
        const state = get();
        const levelInfo = calculateLevel(state.totalXP);
        const streak = calculateStreak(state.loginDates);
        const profileCompletion = calculateProfileCompletion(state.profile);

        return {
          ...levelInfo,
          totalXP: state.totalXP,
          streak: streak.current,
          maxStreak: streak.max,
          profileCompletion,
          totalApplications: state.applications.length,
          appliedCount: state.applications.filter(a => a.status === 'applied').length,
          reviewingCount: state.applications.filter(a => a.status === 'reviewing').length,
          interviewCount: state.applications.filter(a => a.status === 'interview').length,
          rejectedCount: state.applications.filter(a => a.status === 'rejected').length,
          acceptedCount: state.applications.filter(a => a.status === 'accepted').length,
        };
      },
    }),
    {
      name: 'questcareer-storage',
    }
  )
);

export default useStore;
