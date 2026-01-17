import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useObjectiveStore } from '@/lib/store';
import { CATEGORY_CONFIG, type Objective } from '@/lib/types';

function ObjectiveCard({ objective }: { objective: Objective }) {
  const categoryConfig = CATEGORY_CONFIG[objective.category];
  
  // Calculate overall progress from pillars
  const overallProgress = objective.pillars.length > 0
    ? objective.pillars.reduce((sum, p) => sum + p.progress * p.weight, 0)
    : 0;

  // Count active rituals
  const activeRituals = objective.rituals.length;
  const completedToday = objective.rituals.filter(
    (r) => r.lastCompletedAt && new Date(r.lastCompletedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <Pressable className="rounded-2xl p-5 bg-telofy-surface border border-telofy-border mb-4 active:opacity-90">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${categoryConfig.color}20` }}
        >
          <FontAwesome name={categoryConfig.icon as any} size={20} color={categoryConfig.color} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-telofy-text-secondary text-xs tracking-wide">
            {categoryConfig.label.toUpperCase()}
          </Text>
          <Text className="text-telofy-text text-lg font-bold">{objective.name}</Text>
        </View>
        {objective.isPaused && (
          <View className="bg-telofy-muted/20 px-2 py-1 rounded">
            <Text className="text-telofy-muted text-xs">PAUSED</Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-telofy-text-secondary text-sm">Overall Progress</Text>
          <Text className="text-telofy-accent font-semibold">{Math.round(overallProgress)}%</Text>
        </View>
        <View className="h-2 bg-telofy-bg rounded-full overflow-hidden">
          <View
            className="h-full bg-telofy-accent rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row">
        <View className="flex-1">
          <Text className="text-telofy-text font-semibold">{objective.pillars.length}</Text>
          <Text className="text-telofy-text-secondary text-sm">Pillars</Text>
        </View>
        <View className="flex-1">
          <Text className="text-telofy-text font-semibold">{objective.metrics.length}</Text>
          <Text className="text-telofy-text-secondary text-sm">Metrics</Text>
        </View>
        <View className="flex-1">
          <Text className="text-telofy-text font-semibold">
            {completedToday}/{activeRituals}
          </Text>
          <Text className="text-telofy-text-secondary text-sm">Rituals Today</Text>
        </View>
      </View>

      {/* Target Outcome */}
      <View className="mt-4 pt-4 border-t border-telofy-border">
        <Text className="text-telofy-text-secondary text-xs mb-1">TARGET</Text>
        <Text className="text-telofy-text text-sm" numberOfLines={2}>
          {objective.targetOutcome}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-16 px-8">
      <View className="w-24 h-24 rounded-full bg-telofy-surface items-center justify-center mb-6">
        <FontAwesome name="crosshairs" size={40} color="#22c55e" />
      </View>
      <Text className="text-telofy-text text-2xl font-bold text-center mb-3">
        No objectives yet
      </Text>
      <Text className="text-telofy-text-secondary text-center mb-8">
        Define what you want to achieve. Telofy will break it down into actionable pillars, metrics, and daily rituals.
      </Text>
      <Link href="/create-objective" asChild>
        <Pressable className="bg-telofy-accent rounded-xl py-4 px-8 active:opacity-80">
          <Text className="text-telofy-bg font-semibold text-lg">Create Your First Objective</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export default function ObjectiveScreen() {
  const objectives = useObjectiveStore((s) => s.objectives);
  const activeObjectives = objectives.filter((o) => !o.isPaused);
  const pausedObjectives = objectives.filter((o) => o.isPaused);

  if (objectives.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Active Objectives */}
        {activeObjectives.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-telofy-text-secondary text-sm tracking-wide">
                ACTIVE OBJECTIVES ({activeObjectives.length})
              </Text>
              <Link href="/create-objective" asChild>
                <Pressable className="flex-row items-center">
                  <FontAwesome name="plus" size={14} color="#22c55e" />
                  <Text className="text-telofy-accent ml-2 font-medium">Add</Text>
                </Pressable>
              </Link>
            </View>
            {activeObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} />
            ))}
          </>
        )}

        {/* Paused Objectives */}
        {pausedObjectives.length > 0 && (
          <>
            <Text className="text-telofy-text-secondary text-sm tracking-wide mt-6 mb-4">
              PAUSED ({pausedObjectives.length})
            </Text>
            {pausedObjectives.map((obj) => (
              <ObjectiveCard key={obj.id} objective={obj} />
            ))}
          </>
        )}

        {/* Add More */}
        {objectives.length > 0 && activeObjectives.length === 0 && (
          <View className="items-center py-8">
            <Link href="/create-objective" asChild>
              <Pressable className="bg-telofy-accent rounded-xl py-4 px-8 active:opacity-80">
                <Text className="text-telofy-bg font-semibold">Add New Objective</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
