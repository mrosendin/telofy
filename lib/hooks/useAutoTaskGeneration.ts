/**
 * Hook to auto-generate daily tasks when the app opens
 */

import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useObjectiveStore, useTaskStore } from '../store';
import { generateTaskPlan } from '../api/openai';
import { generateId } from '../utils/id';
import { isToday } from '../utils/date';
import type { Task } from '../types';

const LAST_GENERATION_KEY = 'goalmax:lastTaskGeneration';

export function useAutoTaskGeneration() {
  const objectives = useObjectiveStore((s) => s.objectives);
  const tasks = useTaskStore((s) => s.tasks);
  const addTasks = useTaskStore((s) => s.addTasks);
  const isGenerating = useRef(false);

  const generateTasksForObjective = useCallback(async (objective: typeof objectives[0]) => {
    const now = new Date();
    let nextSlot = new Date(now);
    nextSlot.setMinutes(Math.ceil(nextSlot.getMinutes() / 15) * 15, 0, 0);

    try {
      console.log(`[Goalmax Auto] Generating tasks for: ${objective.name}`);
      
      // Get existing tasks for today for this objective
      const existingTodayTasks = tasks.filter(
        (t) => t.objectiveId === objective.id && isToday(new Date(t.scheduledAt))
      );

      const plan = await generateTaskPlan(objective, [], existingTodayTasks);

      if (!plan.tasks || plan.tasks.length === 0) {
        console.log(`[Goalmax Auto] No tasks generated for ${objective.name}`);
        return [];
      }

      const newTasks: Task[] = plan.tasks.map((t, index) => {
        let scheduledAt: Date;

        if (t.scheduledAt) {
          scheduledAt = new Date(t.scheduledAt);
          if (isNaN(scheduledAt.getTime()) || scheduledAt < now) {
            scheduledAt = new Date(nextSlot.getTime() + index * 30 * 60 * 1000);
          }
        } else {
          scheduledAt = new Date(nextSlot.getTime() + index * 30 * 60 * 1000);
        }

        return {
          ...t,
          id: generateId(),
          status: 'pending' as const,
          scheduledAt,
        };
      });

      console.log(`[Goalmax Auto] Generated ${newTasks.length} tasks for ${objective.name}`);
      return newTasks;
    } catch (error) {
      console.error(`[Goalmax Auto] Failed to generate tasks for ${objective.name}:`, error);
      return [];
    }
  }, [tasks]);

  const checkAndGenerateTasks = useCallback(async () => {
    if (isGenerating.current) return;
    
    const activeObjectives = objectives.filter((o) => !o.isPaused);
    if (activeObjectives.length === 0) {
      console.log('[Goalmax Auto] No active objectives, skipping');
      return;
    }

    // Check if we already generated tasks today
    const lastGenStr = await AsyncStorage.getItem(LAST_GENERATION_KEY);
    if (lastGenStr) {
      const lastGen = new Date(lastGenStr);
      if (isToday(lastGen)) {
        console.log('[Goalmax Auto] Already generated tasks today, skipping');
        return;
      }
    }

    // Check if we already have tasks for today
    const todaysTasks = tasks.filter((t) => isToday(new Date(t.scheduledAt)));
    if (todaysTasks.length > 0) {
      console.log(`[Goalmax Auto] Already have ${todaysTasks.length} tasks for today, marking as generated`);
      await AsyncStorage.setItem(LAST_GENERATION_KEY, new Date().toISOString());
      return;
    }

    // It's too late to generate tasks (after 9 PM)
    const hour = new Date().getHours();
    if (hour >= 21) {
      console.log('[Goalmax Auto] Too late to generate tasks (after 9 PM)');
      return;
    }

    isGenerating.current = true;
    console.log('[Goalmax Auto] Starting auto-generation for', activeObjectives.length, 'objectives');

    try {
      const allNewTasks: Task[] = [];

      for (const objective of activeObjectives) {
        const newTasks = await generateTasksForObjective(objective);
        allNewTasks.push(...newTasks);
      }

      if (allNewTasks.length > 0) {
        addTasks(allNewTasks);
        console.log(`[Goalmax Auto] Added ${allNewTasks.length} total tasks`);
      }

      await AsyncStorage.setItem(LAST_GENERATION_KEY, new Date().toISOString());
    } finally {
      isGenerating.current = false;
    }
  }, [objectives, tasks, addTasks, generateTasksForObjective]);

  // Run on mount and when objectives change
  useEffect(() => {
    // Small delay to let the app settle
    const timer = setTimeout(() => {
      checkAndGenerateTasks();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkAndGenerateTasks]);

  return { checkAndGenerateTasks, isGenerating: isGenerating.current };
}
