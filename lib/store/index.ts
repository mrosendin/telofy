/**
 * Zustand stores for Telofy state management
 * Using AsyncStorage for Expo Go compatibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  DailyStatus,
  DataPoint,
  Deviation,
  NotificationPreference,
  Objective,
  RitualCompletion,
  Task,
  TimeBlock
} from '../types';

// ============================================
// OBJECTIVE STORE
// ============================================

interface ObjectiveState {
  objectives: Objective[];
  
  // Actions
  addObjective: (objective: Objective) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  removeObjective: (id: string) => void;
  
  // Pillar actions
  updatePillarProgress: (objectiveId: string, pillarId: string, progress: number) => void;
  
  // Metric actions
  addMetricDataPoint: (objectiveId: string, metricId: string, value: number, note?: string) => void;
  
  // Ritual actions
  completeRitual: (objectiveId: string, ritualId: string, note?: string) => void;
  
  // Getters
  getObjective: (id: string) => Objective | undefined;
  getActiveObjectives: () => Objective[];
}

export const useObjectiveStore = create<ObjectiveState>()(
  persist(
    immer((set, get) => ({
      objectives: [],

      addObjective: (objective) =>
        set((state) => {
          state.objectives.push(objective);
        }),

      updateObjective: (id, updates) =>
        set((state) => {
          const index = state.objectives.findIndex((o) => o.id === id);
          if (index !== -1) {
            state.objectives[index] = {
              ...state.objectives[index],
              ...updates,
              updatedAt: new Date(),
            };
          }
        }),

      removeObjective: (id) =>
        set((state) => {
          state.objectives = state.objectives.filter((o) => o.id !== id);
        }),

      updatePillarProgress: (objectiveId, pillarId, progress) =>
        set((state) => {
          const objective = state.objectives.find((o) => o.id === objectiveId);
          if (objective) {
            const pillar = objective.pillars.find((p) => p.id === pillarId);
            if (pillar) {
              pillar.progress = Math.max(0, Math.min(100, progress));
            }
            objective.updatedAt = new Date();
          }
        }),

      addMetricDataPoint: (objectiveId, metricId, value, note) =>
        set((state) => {
          const objective = state.objectives.find((o) => o.id === objectiveId);
          if (objective) {
            const metric = objective.metrics.find((m) => m.id === metricId);
            if (metric) {
              const dataPoint: DataPoint = {
                date: new Date(),
                value,
                note,
              };
              metric.history.push(dataPoint);
              metric.current = value;
            }
            objective.updatedAt = new Date();
          }
        }),

      completeRitual: (objectiveId, ritualId, note) =>
        set((state) => {
          const objective = state.objectives.find((o) => o.id === objectiveId);
          if (objective) {
            const ritual = objective.rituals.find((r) => r.id === ritualId);
            if (ritual) {
              const now = new Date();
              const completion: RitualCompletion = {
                date: now,
                completed: true,
                note,
              };
              ritual.completionHistory.push(completion);
              ritual.lastCompletedAt = now;
              ritual.completionsThisPeriod += 1;
              ritual.currentStreak += 1;
              if (ritual.currentStreak > ritual.longestStreak) {
                ritual.longestStreak = ritual.currentStreak;
              }
            }
            objective.updatedAt = new Date();
          }
        }),

      getObjective: (id) => {
        return get().objectives.find((o) => o.id === id);
      },

      getActiveObjectives: () => {
        return get().objectives.filter((o) => !o.isPaused && o.status !== 'completed');
      },
    })),
    {
      name: 'telofy-objectives',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// TASK STORE
// ============================================

interface TaskState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  skipTask: (id: string, reason?: string) => void;
  startTask: (id: string) => void;
  clearOldTasks: (daysToKeep: number) => void;
  
  // Getters
  getTasksForDate: (date: Date) => Task[];
  getTasksForObjective: (objectiveId: string) => Task[];
  getTodaysTasks: () => Task[];
  getInProgressTask: () => Task | undefined;
}

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),

      addTasks: (tasks) =>
        set((state) => {
          state.tasks.push(...tasks);
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updates };
          }
        }),

      completeTask: (id) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index].status = 'completed';
            state.tasks[index].completedAt = new Date();
          }
        }),

      skipTask: (id, reason) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index].status = 'skipped';
            state.tasks[index].skippedReason = reason;
          }
        }),

      startTask: (id) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index].status = 'in_progress';
          }
        }),

      clearOldTasks: (daysToKeep) =>
        set((state) => {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - daysToKeep);
          state.tasks = state.tasks.filter(
            (t) => new Date(t.scheduledAt) >= cutoff || t.status === 'pending'
          );
        }),

      getTasksForDate: (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return get().tasks.filter(
          (t) => new Date(t.scheduledAt).toISOString().split('T')[0] === dateStr
        );
      },

      getTasksForObjective: (objectiveId) => {
        return get().tasks.filter((t) => t.objectiveId === objectiveId);
      },

      getTodaysTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter(
          (t) => new Date(t.scheduledAt).toISOString().split('T')[0] === today
        );
      },

      getInProgressTask: () => {
        return get().tasks.find((t) => t.status === 'in_progress');
      },
    })),
    {
      name: 'telofy-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// SCHEDULE STORE
// ============================================

interface ScheduleState {
  timeBlocks: TimeBlock[];
  
  // Actions
  addTimeBlock: (block: TimeBlock) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeTimeBlock: (id: string) => void;
  
  // Getters
  getAvailableBlocks: (dayOfWeek: number) => TimeBlock[];
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    immer((set, get) => ({
      timeBlocks: [],

      addTimeBlock: (block) =>
        set((state) => {
          state.timeBlocks.push(block);
        }),

      updateTimeBlock: (id, updates) =>
        set((state) => {
          const index = state.timeBlocks.findIndex((b) => b.id === id);
          if (index !== -1) {
            state.timeBlocks[index] = { ...state.timeBlocks[index], ...updates };
          }
        }),

      removeTimeBlock: (id) =>
        set((state) => {
          state.timeBlocks = state.timeBlocks.filter((b) => b.id !== id);
        }),

      getAvailableBlocks: (dayOfWeek) => {
        return get().timeBlocks.filter(
          (b) =>
            b.type === 'available' &&
            (!b.isRecurring || b.recurringDays?.includes(dayOfWeek))
        );
      },
    })),
    {
      name: 'telofy-schedule',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// STATUS STORE
// ============================================

interface StatusState {
  dailyStatuses: DailyStatus[];
  deviations: Deviation[];
  
  // Actions
  addDailyStatus: (status: DailyStatus) => void;
  addDeviation: (deviation: Deviation) => void;
  resolveDeviation: (id: string) => void;
  
  // Getters
  getTodayStatus: (objectiveId: string) => DailyStatus | undefined;
  getUnresolvedDeviations: () => Deviation[];
  getStreakDays: (objectiveId: string) => number;
}

export const useStatusStore = create<StatusState>()(
  persist(
    immer((set, get) => ({
      dailyStatuses: [],
      deviations: [],

      addDailyStatus: (status) =>
        set((state) => {
          state.dailyStatuses.push(status);
        }),

      addDeviation: (deviation) =>
        set((state) => {
          state.deviations.push(deviation);
        }),

      resolveDeviation: (id) =>
        set((state) => {
          const index = state.deviations.findIndex((d) => d.id === id);
          if (index !== -1) {
            state.deviations[index].resolvedAt = new Date();
          }
        }),

      getTodayStatus: (objectiveId) => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyStatuses.find(
          (s) =>
            s.objectiveId === objectiveId &&
            new Date(s.date).toISOString().split('T')[0] === today
        );
      },

      getUnresolvedDeviations: () => {
        return get().deviations.filter((d) => !d.resolvedAt);
      },

      getStreakDays: (objectiveId) => {
        const statuses = get()
          .dailyStatuses.filter((s) => s.objectiveId === objectiveId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const status of statuses) {
          const statusDate = new Date(status.date);
          statusDate.setHours(0, 0, 0, 0);

          const daysDiff = Math.floor(
            (today.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === streak && status.status === 'on_track') {
            streak++;
          } else {
            break;
          }
        }

        return streak;
      },
    })),
    {
      name: 'telofy-status',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// SETTINGS STORE
// ============================================

interface SettingsState {
  notificationPreference: NotificationPreference;
  timezone: string;
  onboardingCompleted: boolean;
  
  // Actions
  updateNotificationPreference: (pref: Partial<NotificationPreference>) => void;
  setTimezone: (tz: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      notificationPreference: {
        enabled: true,
        advanceMinutes: 5,
        escalation: true,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      onboardingCompleted: false,

      updateNotificationPreference: (pref) =>
        set((state) => {
          state.notificationPreference = {
            ...state.notificationPreference,
            ...pref,
          };
        }),

      setTimezone: (tz) =>
        set((state) => {
          state.timezone = tz;
        }),

      completeOnboarding: () =>
        set((state) => {
          state.onboardingCompleted = true;
        }),

      resetOnboarding: () =>
        set((state) => {
          state.onboardingCompleted = false;
        }),
    })),
    {
      name: 'telofy-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// ONBOARDING STORE (for objective creation flow)
// ============================================

interface OnboardingState {
  step: number;
  userInput: string;
  aiAnalysis: any | null;
  isAnalyzing: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setUserInput: (input: string) => void;
  setAIAnalysis: (analysis: any) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  immer((set) => ({
    step: 0,
    userInput: '',
    aiAnalysis: null,
    isAnalyzing: false,

    setStep: (step) =>
      set((state) => {
        state.step = step;
      }),

    setUserInput: (input) =>
      set((state) => {
        state.userInput = input;
      }),

    setAIAnalysis: (analysis) =>
      set((state) => {
        state.aiAnalysis = analysis;
      }),

    setIsAnalyzing: (analyzing) =>
      set((state) => {
        state.isAnalyzing = analyzing;
      }),

    reset: () =>
      set((state) => {
        state.step = 0;
        state.userInput = '';
        state.aiAnalysis = null;
        state.isAnalyzing = false;
      }),
  }))
);
