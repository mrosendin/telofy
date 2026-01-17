import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSettingsStore, useObjectiveStore, useTaskStore, useStatusStore } from '@/lib/store';

// Common US timezones + international options
const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', short: 'PT' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', short: 'MT' },
  { value: 'America/Chicago', label: 'Central Time (CT)', short: 'CT' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', short: 'ET' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', short: 'AKT' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', short: 'HST' },
  { value: 'Europe/London', label: 'London (GMT/BST)', short: 'GMT' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)', short: 'CET' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', short: 'CET' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', short: 'JST' },
  { value: 'Asia/Shanghai', label: 'China (CST)', short: 'CST' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', short: 'SGT' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', short: 'AEST' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', short: 'GST' },
  { value: 'Asia/Kolkata', label: 'India (IST)', short: 'IST' },
];

const ADVANCE_NOTICE_OPTIONS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

interface SettingRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  danger,
}: SettingRowProps) {
  return (
    <Pressable
      className="flex-row items-center py-4 border-b border-telofy-border active:opacity-80"
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View className={`w-9 h-9 rounded-lg items-center justify-center ${danger ? 'bg-telofy-error/20' : 'bg-telofy-bg'}`}>
        <FontAwesome name={icon} size={16} color={danger ? '#ef4444' : '#52525b'} />
      </View>
      <Text className={`flex-1 ml-4 text-base ${danger ? 'text-telofy-error' : 'text-telofy-text'}`}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#27272a', true: '#22c55e' }}
          thumbColor="#fafafa"
        />
      ) : value ? (
        <Text className="text-telofy-text-secondary mr-2">{value}</Text>
      ) : null}
      {!hasSwitch && onPress && (
        <FontAwesome name="chevron-right" size={14} color="#52525b" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  // Settings store
  const timezone = useSettingsStore((s) => s.timezone);
  const setTimezone = useSettingsStore((s) => s.setTimezone);
  const notificationPreference = useSettingsStore((s) => s.notificationPreference);
  const updateNotificationPreference = useSettingsStore((s) => s.updateNotificationPreference);

  // For clearing data
  const objectives = useObjectiveStore((s) => s.objectives);

  // Modals
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showAdvanceNoticeModal, setShowAdvanceNoticeModal] = useState(false);

  // Get display name for timezone
  const getTimezoneLabel = useCallback((tz: string) => {
    const found = TIMEZONES.find((t) => t.value === tz);
    return found ? found.label : tz;
  }, []);

  const getTimezoneShort = useCallback((tz: string) => {
    const found = TIMEZONES.find((t) => t.value === tz);
    return found ? found.short : tz.split('/').pop() || tz;
  }, []);

  // Handle clear all data
  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all objectives, tasks, metrics, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            // Clear all stores by resetting them
            // Since we're using AsyncStorage, we can clear the keys
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            try {
              await AsyncStorage.multiRemove([
                'telofy-objectives',
                'telofy-tasks',
                'telofy-status',
                'telofy-settings',
              ]);
              Alert.alert('Data Cleared', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle detect timezone
  const handleDetectTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detected);
    Alert.alert('Timezone Detected', `Set to ${detected}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Profile Section */}
        <View className="items-center py-6 mb-4">
          <View className="w-20 h-20 rounded-full bg-telofy-surface items-center justify-center mb-4">
            <FontAwesome name="user" size={32} color="#52525b" />
          </View>
          <Text className="text-telofy-text text-lg font-semibold">Telofy User</Text>
          <Text className="text-telofy-text-secondary text-sm">
            {objectives.length} active objective{objectives.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Schedule */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            SCHEDULE
          </Text>
          <SettingRow
            icon="globe"
            label="Timezone"
            value={getTimezoneShort(timezone)}
            onPress={() => setShowTimezoneModal(true)}
          />
          <SettingRow
            icon="magic"
            label="Detect Timezone"
            onPress={handleDetectTimezone}
          />
        </View>

        {/* Notifications */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            NOTIFICATIONS
          </Text>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            hasSwitch
            switchValue={notificationPreference.enabled}
            onSwitchChange={(value) => updateNotificationPreference({ enabled: value })}
          />
          <SettingRow
            icon="exclamation-triangle"
            label="Escalation Reminders"
            hasSwitch
            switchValue={notificationPreference.escalation}
            onSwitchChange={(value) => updateNotificationPreference({ escalation: value })}
          />
          <SettingRow
            icon="clock-o"
            label="Advance Notice"
            value={`${notificationPreference.advanceMinutes} min`}
            onPress={() => setShowAdvanceNoticeModal(true)}
          />
        </View>

        {/* Data & Privacy */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            DATA & PRIVACY
          </Text>
          <SettingRow
            icon="download"
            label="Export Data"
            onPress={() => Alert.alert('Coming Soon', 'Data export will be available in a future update.')}
          />
          <SettingRow
            icon="trash"
            label="Clear All Data"
            onPress={handleClearAllData}
            danger
          />
        </View>

        {/* About */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-8 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            ABOUT
          </Text>
          <SettingRow
            icon="info-circle"
            label="Version"
            value="1.0.0"
          />
          <SettingRow
            icon="file-text-o"
            label="Terms of Service"
            onPress={() => Alert.alert('Terms', 'Terms of Service will be available at launch.')}
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy Policy will be available at launch.')}
          />
        </View>

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-telofy-muted text-sm font-semibold">TELOFY</Text>
          <Text className="text-telofy-muted text-xs mt-1">
            Turn intention into execution.
          </Text>
        </View>
      </ScrollView>

      {/* Timezone Picker Modal */}
      <Modal visible={showTimezoneModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-telofy-surface rounded-t-3xl max-h-[70%]">
            <View className="flex-row justify-between items-center p-4 border-b border-telofy-border">
              <Text className="text-telofy-text text-lg font-semibold">Select Timezone</Text>
              <Pressable onPress={() => setShowTimezoneModal(false)}>
                <FontAwesome name="times" size={24} color="#a1a1aa" />
              </Pressable>
            </View>
            <FlatList
              data={TIMEZONES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className={`flex-row items-center py-4 px-6 border-b border-telofy-border ${
                    timezone === item.value ? 'bg-telofy-accent/10' : ''
                  }`}
                  onPress={() => {
                    setTimezone(item.value);
                    setShowTimezoneModal(false);
                  }}
                >
                  <Text className="flex-1 text-telofy-text">{item.label}</Text>
                  {timezone === item.value && (
                    <FontAwesome name="check" size={18} color="#22c55e" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Advance Notice Picker Modal */}
      <Modal visible={showAdvanceNoticeModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-telofy-surface rounded-t-3xl">
            <View className="flex-row justify-between items-center p-4 border-b border-telofy-border">
              <Text className="text-telofy-text text-lg font-semibold">Advance Notice</Text>
              <Pressable onPress={() => setShowAdvanceNoticeModal(false)}>
                <FontAwesome name="times" size={24} color="#a1a1aa" />
              </Pressable>
            </View>
            <View className="pb-8">
              {ADVANCE_NOTICE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  className={`flex-row items-center py-4 px-6 border-b border-telofy-border ${
                    notificationPreference.advanceMinutes === option.value ? 'bg-telofy-accent/10' : ''
                  }`}
                  onPress={() => {
                    updateNotificationPreference({ advanceMinutes: option.value });
                    setShowAdvanceNoticeModal(false);
                  }}
                >
                  <Text className="flex-1 text-telofy-text">{option.label}</Text>
                  {notificationPreference.advanceMinutes === option.value && (
                    <FontAwesome name="check" size={18} color="#22c55e" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
