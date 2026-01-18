import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-goalmax-surface">
      <View className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-goalmax-text text-xl font-bold">Quick Add</Text>
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome name="times" size={20} color="#52525b" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center">
          <View className="w-16 h-16 rounded-full bg-goalmax-bg items-center justify-center mb-4">
            <FontAwesome name="plus" size={24} color="#22c55e" />
          </View>
          <Text className="text-goalmax-text text-lg font-medium mb-2">
            Quick Task
          </Text>
          <Text className="text-goalmax-text-secondary text-center px-8">
            Add a task quickly. Goalmax will schedule it based on your available time.
          </Text>
        </View>

        {/* Action Button */}
        <Pressable className="bg-goalmax-accent rounded-xl py-4 items-center mb-8 active:opacity-80">
          <Text className="text-goalmax-bg font-semibold">Add Task</Text>
        </Pressable>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}
