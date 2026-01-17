/**
 * Core types for the Telofy execution system
 * Supports multiple simultaneous objectives with rich tracking
 */

// ============================================
// OBJECTIVE CATEGORIES
// ============================================

export type ObjectiveCategory =
  | 'career'
  | 'fitness'
  | 'health'
  | 'spiritual'
  | 'social'
  | 'dating'
  | 'style'
  | 'learning'
  | 'financial'
  | 'creative'
  | 'custom';

export const CATEGORY_CONFIG: Record<ObjectiveCategory, {
  label: string;
  icon: string;
  color: string;
  examples: string[];
}> = {
  career: {
    label: 'Career',
    icon: 'briefcase',
    color: '#3b82f6',
    examples: ['Get promoted', 'Switch jobs', 'Build side business'],
  },
  fitness: {
    label: 'Fitness',
    icon: 'heartbeat',
    color: '#ef4444',
    examples: ['Lose weight', 'Build muscle', 'Run a marathon'],
  },
  health: {
    label: 'Health',
    icon: 'medkit',
    color: '#10b981',
    examples: ['Sleep better', 'Eat cleaner', 'Reduce stress'],
  },
  spiritual: {
    label: 'Spiritual',
    icon: 'star',
    color: '#8b5cf6',
    examples: ['Deepen faith', 'Daily meditation', 'Community service'],
  },
  social: {
    label: 'Social',
    icon: 'users',
    color: '#f59e0b',
    examples: ['Expand network', 'Host events', 'Strengthen friendships'],
  },
  dating: {
    label: 'Dating',
    icon: 'heart',
    color: '#ec4899',
    examples: ['Meet more people', 'Improve dating profile', 'Find partner'],
  },
  style: {
    label: 'Style',
    icon: 'star-o',
    color: '#6366f1',
    examples: ['Upgrade wardrobe', 'Develop personal style', 'Grooming routine'],
  },
  learning: {
    label: 'Learning',
    icon: 'graduation-cap',
    color: '#14b8a6',
    examples: ['Master a skill', 'Get certified', 'Learn language'],
  },
  financial: {
    label: 'Financial',
    icon: 'dollar',
    color: '#22c55e',
    examples: ['Save for goal', 'Pay off debt', 'Build investments'],
  },
  creative: {
    label: 'Creative',
    icon: 'paint-brush',
    color: '#f97316',
    examples: ['Write a book', 'Learn instrument', 'Build portfolio'],
  },
  custom: {
    label: 'Custom',
    icon: 'crosshairs',
    color: '#64748b',
    examples: ['Define your own objective'],
  },
};

// ============================================
// CORE OBJECTIVE MODEL
// ============================================

export interface Objective {
  id: string;
  name: string;
  category: ObjectiveCategory;
  description: string;
  targetOutcome: string;
  
  // Breakdown
  pillars: Pillar[];
  metrics: Metric[];
  rituals: Ritual[];
  
  // Timeline
  timeframe: TimeFrame;
  currentPhase?: Phase;
  
  // Status
  status: ObjectiveStatus;
  priority: number; // 1-5, for ordering
  isPaused: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Sub-areas of focus within an objective
export interface Pillar {
  id: string;
  name: string;
  description?: string;
  weight: number; // Importance 0-1, should sum to 1
  progress: number; // 0-100
}

// Quantifiable things we track
export interface Metric {
  id: string;
  name: string;
  unit: string;
  type: 'number' | 'boolean' | 'duration' | 'rating';
  
  // Targets
  target?: number;
  targetDirection?: 'increase' | 'decrease' | 'maintain';
  
  // Current state
  current?: number;
  
  // History for charts
  history: DataPoint[];
  
  // Integration source
  source: 'manual' | 'apple_health' | 'google_fit' | 'calendar' | 'strava';
  
  // Which pillar this relates to
  pillarId?: string;
}

export interface DataPoint {
  date: Date;
  value: number;
  note?: string;
}

// Recurring actions/habits
export interface Ritual {
  id: string;
  name: string;
  description?: string;
  
  // Schedule
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0=Sun, 6=Sat. For weekly rituals.
  timesPerPeriod: number; // e.g., 4 times per week
  
  // Tracking
  currentStreak: number;
  longestStreak: number;
  completionsThisPeriod: number;
  lastCompletedAt?: Date;
  
  // History
  completionHistory: RitualCompletion[];
  
  // Related
  pillarId?: string;
  estimatedMinutes?: number;
}

export interface RitualCompletion {
  date: Date;
  completed: boolean;
  note?: string;
}

// ============================================
// TIME & PHASES
// ============================================

export interface TimeFrame {
  startDate: Date;
  endDate?: Date; // undefined = ongoing
  dailyCommitmentMinutes: number;
}

export interface Phase {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  goals: string[];
}

// ============================================
// TASKS
// ============================================

export interface Task {
  id: string;
  objectiveId: string;
  pillarId?: string;
  ritualId?: string; // If this task is a ritual instance
  
  title: string;
  description?: string;
  
  // Scheduling
  scheduledAt: Date;
  durationMinutes: number;
  
  // Status
  status: TaskStatus;
  completedAt?: Date;
  skippedReason?: string;
  
  // AI-generated context
  whyItMatters?: string;
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'overdue';

// ============================================
// STATUS & DEVIATIONS
// ============================================

export type ObjectiveStatus =
  | 'on_track'
  | 'deviation_detected'
  | 'recalibrating'
  | 'paused'
  | 'completed';

export interface DailyStatus {
  date: Date;
  objectiveId: string;
  status: ObjectiveStatus;
  
  // Task metrics
  completedTasks: number;
  totalTasks: number;
  
  // Ritual metrics
  ritualsCompleted: number;
  ritualsTotal: number;
  
  // Issues
  deviations: Deviation[];
  
  // AI summary
  summary?: string;
}

export interface Deviation {
  id: string;
  taskId?: string;
  ritualId?: string;
  type: DeviationType;
  detectedAt: Date;
  resolvedAt?: Date;
  aiSuggestion?: string;
}

export type DeviationType =
  | 'missed_task'
  | 'missed_ritual'
  | 'streak_broken'
  | 'metric_regressed'
  | 'off_schedule';

// ============================================
// TIME BLOCKS (User's Available Time)
// ============================================

export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string;
  type: TimeBlockType;
  label?: string;
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6
}

export type TimeBlockType =
  | 'available'
  | 'work'
  | 'sleep'
  | 'personal'
  | 'blocked';

// ============================================
// NOTIFICATIONS
// ============================================

export interface NotificationPreference {
  enabled: boolean;
  advanceMinutes: number;
  escalation: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// ============================================
// USER & APP STATE
// ============================================

export interface UserProfile {
  id: string;
  timezone: string;
  notificationPreference: NotificationPreference;
  onboardingCompleted: boolean;
  createdAt: Date;
}

// ============================================
// AI TYPES
// ============================================

export interface AIObjectiveAnalysis {
  name: string;
  category: ObjectiveCategory;
  description: string;
  targetOutcome: string;
  suggestedPillars: Omit<Pillar, 'id' | 'progress'>[];
  suggestedMetrics: Omit<Metric, 'id' | 'history' | 'current'>[];
  suggestedRituals: Omit<Ritual, 'id' | 'currentStreak' | 'longestStreak' | 'completionsThisPeriod' | 'completionHistory'>[];
  suggestedDailyMinutes: number;
  clarifyingQuestions?: string[];
}

export interface AITaskPlan {
  tasks: Omit<Task, 'id' | 'status'>[];
  reasoning: string;
  adjustments?: string;
}

export interface AIContext {
  objective: Objective;
  recentTasks: Task[];
  recentDeviations: Deviation[];
  userFeedback?: string;
}
