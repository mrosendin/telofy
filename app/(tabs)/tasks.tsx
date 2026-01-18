import { useObjectiveStore, useTaskStore } from '@/lib/store';
import { CATEGORY_CONFIG, type Task } from '@/lib/types';
import { isToday } from '@/lib/utils/date';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function TaskCard({ task, onComplete, onSkip, onStart }: {
  task: Task;
  onComplete: () => void;
  onSkip: () => void;
  onStart: () => void;
}) {
  const objective = useObjectiveStore((s) => s.objectives.find((o) => o.id === task.objectiveId));
  const categoryConfig = objective ? CATEGORY_CONFIG[objective.category] : null;
  
  const scheduledTime = new Date(task.scheduledAt);
  const timeStr = scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const isOverdue = task.status === 'pending' && new Date() > scheduledTime;
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const isSkipped = task.status === 'skipped';

  return (
    <View
      className={`rounded-2xl p-5 mb-4 border ${
        isInProgress
          ? 'bg-goalmax-accent/10 border-goalmax-accent'
          : isCompleted
          ? 'bg-goalmax-surface/50 border-goalmax-border'
          : isSkipped
          ? 'bg-goalmax-surface/30 border-goalmax-border'
          : isOverdue
          ? 'bg-goalmax-error/10 border-goalmax-error/50'
          : 'bg-goalmax-surface border-goalmax-border'
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center mb-3">
        {categoryConfig && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${categoryConfig.color}20` }}
          >
            <FontAwesome name={categoryConfig.icon as any} size={14} color={categoryConfig.color} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-goalmax-text-secondary text-xs">
            {objective?.name ?? 'Task'}
          </Text>
          <Text
            className={`text-lg font-bold ${
              isCompleted || isSkipped ? 'text-goalmax-text-secondary line-through' : 'text-goalmax-text'
            }`}
          >
            {task.title}
          </Text>
        </View>
        {isInProgress && (
          <View className="bg-goalmax-accent px-2 py-1 rounded">
            <Text className="text-goalmax-bg text-xs font-semibold">IN PROGRESS</Text>
          </View>
        )}
        {isOverdue && !isInProgress && (
          <View className="bg-goalmax-error/20 px-2 py-1 rounded">
            <Text className="text-goalmax-error text-xs font-semibold">OVERDUE</Text>
          </View>
        )}
      </View>

      {/* Time & Duration */}
      <View className="flex-row items-center mb-3">
        <FontAwesome name="clock-o" size={14} color="#71717a" />
        <Text className="text-goalmax-text-secondary ml-2">{timeStr}</Text>
        <Text className="text-goalmax-text-secondary mx-2">•</Text>
        <Text className="text-goalmax-text-secondary">{task.durationMinutes} min</Text>
      </View>

      {/* Why it matters */}
      {task.whyItMatters && (
        <Text className="text-goalmax-text-secondary text-sm italic mb-4">
          "{task.whyItMatters}"
        </Text>
      )}

      {/* Actions */}
      {!isCompleted && !isSkipped && (
        <View className="flex-row gap-3">
          {!isInProgress ? (
            <Pressable
              className="flex-1 bg-goalmax-accent rounded-xl py-3 items-center active:opacity-80"
              onPress={onStart}
            >
              <Text className="text-goalmax-bg font-semibold">Start</Text>
            </Pressable>
          ) : (
            <Pressable
              className="flex-1 bg-goalmax-accent rounded-xl py-3 items-center active:opacity-80"
              onPress={onComplete}
            >
              <Text className="text-goalmax-bg font-semibold">Complete</Text>
            </Pressable>
          )}
          <Pressable
            className="flex-1 bg-goalmax-bg rounded-xl py-3 items-center border border-goalmax-border active:opacity-80"
            onPress={onSkip}
          >
            <Text className="text-goalmax-text font-semibold">Skip</Text>
          </Pressable>
        </View>
      )}

      {/* Completed/Skipped indicator */}
      {isCompleted && (
        <View className="flex-row items-center">
          <FontAwesome name="check-circle" size={16} color="#22c55e" />
          <Text className="text-goalmax-accent ml-2">Completed</Text>
        </View>
      )}
      {isSkipped && (
        <View className="flex-row items-center">
          <FontAwesome name="times-circle" size={16} color="#52525b" />
          <Text className="text-goalmax-muted ml-2">
            Skipped{task.skippedReason ? `: ${task.skippedReason}` : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-16 px-8">
      <View className="w-24 h-24 rounded-full bg-goalmax-surface items-center justify-center mb-6">
        <FontAwesome name="tasks" size={40} color="#22c55e" />
      </View>
      <Text className="text-goalmax-text text-2xl font-bold text-center mb-3">
        No tasks scheduled
      </Text>
      <Text className="text-goalmax-text-secondary text-center">
        Go to an objective and tap "Generate Today's Tasks" to create your execution plan for the day.
      </Text>
    </View>
  );
}

export default function TasksScreen() {
  const tasks = useTaskStore((s) => s.tasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const skipTask = useTaskStore((s) => s.skipTask);
  const startTask = useTaskStore((s) => s.startTask);

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState<Task | null>(null);
  const [skipReason, setSkipReason] = useState('');

  // Memoize today's tasks to avoid infinite loop (using local timezone)
  const todaysTasks = useMemo(() => {
    return tasks.filter((t) => isToday(new Date(t.scheduledAt)));
  }, [tasks]);

  // Sort tasks: in_progress first, then pending, then by time, completed/skipped last
  const sortedTasks = useMemo(() => [...todaysTasks].sort((a, b) => {
    const statusOrder = { in_progress: 0, pending: 1, overdue: 2, completed: 3, skipped: 4 };
    const aOrder = statusOrder[a.status];
    const bOrder = statusOrder[b.status];
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  }), [todaysTasks]);

  const pendingCount = todaysTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = todaysTasks.filter((t) => t.status === 'completed').length;

  const handleSkip = (task: Task) => {
    setTaskToSkip(task);
    setSkipReason('');
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    if (taskToSkip) {
      skipTask(taskToSkip.id, skipReason || undefined);
      setShowSkipModal(false);
      setTaskToSkip(null);
    }
  };

  if (todaysTasks.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-goalmax-bg" edges={['bottom']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-goalmax-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Summary */}
        <View className="rounded-2xl p-5 bg-goalmax-surface border border-goalmax-border mb-6">
          <Text className="text-goalmax-text-secondary text-sm mb-3 tracking-wide">TODAY'S EXECUTION</Text>
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-goalmax-text text-3xl font-bold">
                {completedCount}/{todaysTasks.length}
              </Text>
              <Text className="text-goalmax-text-secondary">tasks completed</Text>
            </View>
            <View className="w-20 h-20">
              <View className="absolute inset-0 rounded-full border-4 border-goalmax-border" />
              <View
                className="absolute inset-0 rounded-full border-4 border-goalmax-accent"
                style={{
                  transform: [{ rotate: '-90deg' }],
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: todaysTasks.length > 0 && completedCount / todaysTasks.length >= 0.5 ? '#22c55e' : 'transparent',
                }}
              />
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-goalmax-text font-bold">
                  {todaysTasks.length > 0 ? Math.round((completedCount / todaysTasks.length) * 100) : 0}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Tasks */}
        {pendingCount > 0 && (
          <>
            <Text className="text-goalmax-text-secondary text-sm mb-3 tracking-wide">
              PENDING ({pendingCount})
            </Text>
            {sortedTasks
              .filter((t) => t.status === 'pending' || t.status === 'in_progress')
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onSkip={() => handleSkip(task)}
                  onStart={() => startTask(task.id)}
                />
              ))}
          </>
        )}

        {/* Completed Tasks */}
        {completedCount > 0 && (
          <>
            <Text className="text-goalmax-text-secondary text-sm mb-3 mt-4 tracking-wide">
              COMPLETED ({completedCount})
            </Text>
            {sortedTasks
              .filter((t) => t.status === 'completed')
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onSkip={() => {}}
                  onStart={() => {}}
                />
              ))}
          </>
        )}

        {/* Skipped Tasks */}
        {sortedTasks.some((t) => t.status === 'skipped') && (
          <>
            <Text className="text-goalmax-text-secondary text-sm mb-3 mt-4 tracking-wide">
              SKIPPED
            </Text>
            {sortedTasks
              .filter((t) => t.status === 'skipped')
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onSkip={() => {}}
                  onStart={() => {}}
                />
              ))}
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Skip Reason Modal */}
      <Modal visible={showSkipModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-goalmax-surface rounded-t-3xl p-6">
              <Text className="text-goalmax-text text-xl font-bold mb-2">Skip Task</Text>
              <Text className="text-goalmax-text-secondary mb-4">
                Why are you skipping "{taskToSkip?.title}"?
              </Text>

              <TextInput
                className="text-goalmax-text p-4 rounded-xl bg-goalmax-bg border border-goalmax-border mb-6"
                style={{ textAlignVertical: 'center' }}
                value={skipReason}
                onChangeText={setSkipReason}
                placeholder="Enter reason (optional)"
                placeholderTextColor="#52525b"
                autoFocus
              />

              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 rounded-xl py-4 items-center bg-goalmax-bg border border-goalmax-border"
                  onPress={() => setShowSkipModal(false)}
                >
                  <Text className="text-goalmax-text font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-xl py-4 items-center bg-goalmax-error"
                  onPress={confirmSkip}
                >
                  <Text className="text-white font-semibold">Skip Task</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
