import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useObjectiveStore, useTaskStore } from '@/lib/store';
import { CATEGORY_CONFIG, type Objective, type Task } from '@/lib/types';
import { isToday } from '@/lib/utils/date';

// Helper to filter today's tasks (using local timezone)
const filterTodaysTasks = (tasks: Task[]) => {
  return tasks.filter((t) => isToday(new Date(t.scheduledAt)));
};

function ObjectiveStatusCard({ objective, allTasks }: { objective: Objective; allTasks: Task[] }) {
  const categoryConfig = CATEGORY_CONFIG[objective.category];
  
  // Filter tasks for this objective (using local timezone)
  const tasks = useMemo(() => {
    return allTasks.filter(
      (t) =>
        t.objectiveId === objective.id &&
        isToday(new Date(t.scheduledAt))
    );
  }, [allTasks, objective.id]);
  
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  
  // Calculate rituals due today
  const today = new Date().getDay();
  const ritualsDueToday = objective.rituals.filter((r) => {
    if (r.frequency === 'daily') return true;
    if (r.frequency === 'weekly' && r.daysOfWeek?.includes(today)) return true;
    return false;
  });
  
  const ritualsCompletedToday = ritualsDueToday.filter((r) => {
    if (!r.lastCompletedAt) return false;
    return new Date(r.lastCompletedAt).toDateString() === new Date().toDateString();
  }).length;

  // Determine status
  const allComplete = completedTasks === totalTasks && ritualsCompletedToday === ritualsDueToday.length;
  const hasProgress = completedTasks > 0 || ritualsCompletedToday > 0;
  
  let statusLabel = 'ON TRACK';
  let statusColor = '#22c55e';
  let statusBg = 'bg-goalmax-accent/10';
  
  if (objective.isPaused) {
    statusLabel = 'PAUSED';
    statusColor = '#52525b';
    statusBg = 'bg-goalmax-muted/10';
  } else if (totalTasks === 0 && ritualsDueToday.length === 0) {
    statusLabel = 'NO TASKS';
    statusColor = '#52525b';
    statusBg = 'bg-goalmax-muted/10';
  } else if (allComplete) {
    statusLabel = 'COMPLETE';
    statusColor = '#22c55e';
    statusBg = 'bg-goalmax-accent/10';
  } else if (!hasProgress) {
    statusLabel = 'PENDING';
    statusColor = '#f59e0b';
    statusBg = 'bg-goalmax-warning/10';
  }

  return (
    <View className={`rounded-2xl p-5 ${statusBg} border border-goalmax-border mb-4`}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${categoryConfig.color}30` }}
        >
          <FontAwesome name={categoryConfig.icon as any} size={16} color={categoryConfig.color} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-goalmax-text font-bold text-lg">{objective.name}</Text>
          <View className="flex-row items-center mt-1">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: statusColor }}
            />
            <Text style={{ color: statusColor }} className="text-sm font-medium">
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Stats */}
      <View className="flex-row">
        <View className="flex-1">
          <Text className="text-goalmax-text text-2xl font-bold">
            {completedTasks}/{totalTasks}
          </Text>
          <Text className="text-goalmax-text-secondary text-sm">Tasks</Text>
        </View>
        <View className="w-px bg-goalmax-border mx-4" />
        <View className="flex-1">
          <Text className="text-goalmax-text text-2xl font-bold">
            {ritualsCompletedToday}/{ritualsDueToday.length}
          </Text>
          <Text className="text-goalmax-text-secondary text-sm">Rituals</Text>
        </View>
        <View className="w-px bg-goalmax-border mx-4" />
        <View className="flex-1">
          <Text className="text-goalmax-text text-2xl font-bold">
            {objective.rituals[0]?.currentStreak ?? 0}
          </Text>
          <Text className="text-goalmax-text-secondary text-sm">Streak</Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-16 px-8">
      <View className="w-24 h-24 rounded-full bg-goalmax-surface items-center justify-center mb-6">
        <FontAwesome name="rocket" size={40} color="#22c55e" />
      </View>
      <Text className="text-goalmax-text text-2xl font-bold text-center mb-3">
        Welcome to Goalmax
      </Text>
      <Text className="text-goalmax-text-secondary text-center mb-2">
        Turn intention into execution.
      </Text>
      <Text className="text-goalmax-text-secondary text-center mb-8">
        Define your objective function and let Goalmax handle the execution.
      </Text>
      <Link href="/create-objective" asChild>
        <Pressable className="bg-goalmax-accent rounded-xl py-4 px-8 active:opacity-80">
          <Text className="text-goalmax-bg font-semibold text-lg">Get Started</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function NextTaskCard({ todaysTasks }: { todaysTasks: Task[] }) {
  const objectives = useObjectiveStore((s) => s.objectives);

  const inProgressTask = todaysTasks.find((t) => t.status === 'in_progress');
  const pendingTasks = todaysTasks.filter((t) => t.status === 'pending');
  const nextTask = inProgressTask ?? pendingTasks[0];

  if (!nextTask) {
    if (todaysTasks.length === 0) return null;
    
    // All tasks complete
    return (
      <View className="rounded-2xl p-5 bg-goalmax-accent/10 border border-goalmax-accent mb-6">
        <View className="flex-row items-center">
          <FontAwesome name="check-circle" size={24} color="#22c55e" />
          <View className="ml-4">
            <Text className="text-goalmax-accent font-semibold text-lg">All tasks complete</Text>
            <Text className="text-goalmax-text-secondary">Great execution today.</Text>
          </View>
        </View>
      </View>
    );
  }

  const objective = objectives.find((o) => o.id === nextTask.objectiveId);
  const scheduledTime = new Date(nextTask.scheduledAt);
  const timeStr = scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View className="rounded-2xl p-5 bg-goalmax-surface border border-goalmax-border mb-6">
      <Text className="text-goalmax-text-secondary text-sm mb-2 tracking-wide">
        {inProgressTask ? 'IN PROGRESS' : 'NEXT UP'}
      </Text>
      <Text className="text-goalmax-text text-xl font-bold mb-1">{nextTask.title}</Text>
      <Text className="text-goalmax-text-secondary mb-1">
        {timeStr} • {nextTask.durationMinutes} min
        {objective && ` • ${objective.name}`}
      </Text>
      {nextTask.whyItMatters && (
        <Text className="text-goalmax-text-secondary text-sm italic mt-2">
          "{nextTask.whyItMatters}"
        </Text>
      )}
      <View className="flex-row gap-3 mt-4">
        <Pressable className="flex-1 bg-goalmax-accent rounded-xl py-3 items-center active:opacity-80">
          <Text className="text-goalmax-bg font-semibold">
            {inProgressTask ? 'Complete' : 'Start'}
          </Text>
        </Pressable>
        <Pressable className="flex-1 bg-goalmax-bg rounded-xl py-3 items-center border border-goalmax-border active:opacity-80">
          <Text className="text-goalmax-text font-semibold">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function StatusScreen() {
  const objectives = useObjectiveStore((s) => s.objectives);
  const tasks = useTaskStore((s) => s.tasks);
  
  // Memoize today's tasks to avoid recalculating on every render
  const todaysTasks = useMemo(() => filterTodaysTasks(tasks), [tasks]);
  const activeObjectives = useMemo(() => objectives.filter((o) => !o.isPaused), [objectives]);
  
  const completedTasks = todaysTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = todaysTasks.length;

  if (objectives.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-goalmax-bg" edges={['bottom']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-goalmax-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Overall Daily Summary */}
        <View className="rounded-2xl p-5 bg-goalmax-surface border border-goalmax-border mb-6">
          <Text className="text-goalmax-text-secondary text-sm mb-3 tracking-wide">
            TODAY'S EXECUTION
          </Text>
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full border-4 border-goalmax-accent/30 items-center justify-center">
              <Text className="text-goalmax-text text-2xl font-bold">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </Text>
            </View>
            <View className="ml-6 flex-1">
              <Text className="text-goalmax-text text-lg font-semibold">
                {completedTasks}/{totalTasks} tasks complete
              </Text>
              <Text className="text-goalmax-text-secondary">
                {activeObjectives.length} active objective{activeObjectives.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Next Task */}
        <NextTaskCard todaysTasks={todaysTasks} />

        {/* Objectives Status */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-goalmax-text-secondary text-sm tracking-wide">
            OBJECTIVES STATUS
          </Text>
          <Link href="/create-objective" asChild>
            <Pressable className="flex-row items-center">
              <FontAwesome name="plus" size={12} color="#22c55e" />
              <Text className="text-goalmax-accent ml-2 text-sm font-medium">Add</Text>
            </Pressable>
          </Link>
        </View>
        
        {activeObjectives.map((obj) => (
          <ObjectiveStatusCard key={obj.id} objective={obj} allTasks={tasks} />
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
