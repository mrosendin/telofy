/**
 * Hook to manage task notifications
 * Automatically schedules/reschedules notifications when tasks change
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTaskStore, useSettingsStore, useObjectiveStore } from '../store';
import {
  scheduleTaskNotifications,
  cancelTaskNotifications,
  scheduleRecurringMorningBriefing,
  cancelAllScheduledNotifications,
  listScheduledNotifications,
} from '../services/notificationScheduler';
import { isToday } from 'date-fns';

/**
 * Hook to automatically schedule notifications for tasks
 * Call this once in your app root
 */
export function useTaskNotifications() {
  const tasks = useTaskStore((s) => s.tasks);
  const objectives = useObjectiveStore((s) => s.objectives);
  const notificationPreference = useSettingsStore((s) => s.notificationPreference);
  const appState = useRef(AppState.currentState);
  const lastScheduledRef = useRef<string>('');

  // Schedule notifications when tasks or preferences change
  useEffect(() => {
    const todaysTasks = tasks.filter(
      (t) => isToday(new Date(t.scheduledAt)) && t.status === 'pending'
    );

    // Create a signature to detect actual changes
    const signature = todaysTasks.map((t) => `${t.id}:${t.scheduledAt}`).join(',');
    
    // Skip if nothing changed
    if (signature === lastScheduledRef.current) {
      return;
    }

    lastScheduledRef.current = signature;

    const scheduleAll = async () => {
      if (notificationPreference.enabled && todaysTasks.length > 0) {
        console.log('[useTaskNotifications] Scheduling notifications for tasks');
        await scheduleTaskNotifications(todaysTasks, notificationPreference);
        
        // Debug: list scheduled notifications
        await listScheduledNotifications();
      }
    };

    scheduleAll();
  }, [tasks, notificationPreference]);

  // Cancel notifications when a task is completed or skipped
  useEffect(() => {
    const completedOrSkipped = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'skipped'
    );

    for (const task of completedOrSkipped) {
      cancelTaskNotifications(task.id);
    }
  }, [tasks]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // When app comes to foreground, refresh notifications
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useTaskNotifications] App came to foreground, refreshing notifications');
        
        const todaysTasks = tasks.filter(
          (t) => isToday(new Date(t.scheduledAt)) && t.status === 'pending'
        );
        
        if (notificationPreference.enabled && todaysTasks.length > 0) {
          await scheduleTaskNotifications(todaysTasks, notificationPreference);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [tasks, notificationPreference]);

  // Setup morning briefing on mount
  useEffect(() => {
    if (notificationPreference.enabled) {
      scheduleRecurringMorningBriefing(7, 0); // 7:00 AM daily
    }
  }, [notificationPreference.enabled]);
}

export default useTaskNotifications;
