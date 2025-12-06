import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import activitiesApi, { CreateActivityData } from '@/src/api/endpoints/activities';
import { useAuth } from '@/src/hooks';
import { ActivityCategory } from '@/src/types';

export default function CreateActivityScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const [duration, setDuration] = useState('60');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await activitiesApi.getCategories();
      // Handle both array and paginated response
      const categoriesArray = Array.isArray(data) ? data : ((data as any).results || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Use mock categories for demo
      setCategories([
        { id: 1, name: 'Sports', icon: 'futbol-o', color: '#22c55e' },
        { id: 2, name: 'Food & Drinks', icon: 'cutlery', color: '#f97316' },
        { id: 3, name: 'Music', icon: 'music', color: '#8b5cf6' },
        { id: 4, name: 'Gaming', icon: 'gamepad', color: '#3b82f6' },
        { id: 5, name: 'Outdoors', icon: 'tree', color: '#10b981' },
        { id: 6, name: 'Study', icon: 'book', color: '#6366f1' },
        { id: 7, name: 'Social', icon: 'comments', color: '#ec4899' },
        { id: 8, name: 'Fitness', icon: 'heartbeat', color: '#ef4444' },
      ]);
    }
  };

  const validateForm = () => {
    console.log('Validating form:', {
      title,
      selectedCategory,
      locationName,
      address,
      scheduledTime,
      duration,
      maxParticipants
    });
    
    if (!title.trim()) {
      console.log('Validation failed: No title');
      Alert.alert('Error', 'Please enter an activity title');
      return false;
    }
    if (!selectedCategory) {
      console.log('Validation failed: No category');
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!locationName.trim()) {
      console.log('Validation failed: No location name');
      Alert.alert('Error', 'Please enter a location name');
      return false;
    }
    if (!address.trim()) {
      console.log('Validation failed: No address');
      Alert.alert('Error', 'Please enter an address');
      return false;
    }
    if (scheduledTime < new Date()) {
      console.log('Validation failed: Time is in the past');
      Alert.alert('Error', 'Please select a future date and time');
      return false;
    }
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 15 || durationNum > 480) {
      console.log('Validation failed: Invalid duration', duration);
      Alert.alert('Error', 'Duration must be between 15 and 480 minutes');
      return false;
    }
    const maxNum = parseInt(maxParticipants);
    if (isNaN(maxNum) || maxNum < 2 || maxNum > 100) {
      console.log('Validation failed: Invalid max participants', maxParticipants);
      Alert.alert('Error', 'Max participants must be between 2 and 100');
      return false;
    }
    console.log('Validation passed!');
    return true;
  };

  const handleCreate = async () => {
    console.log('handleCreate called');
    console.log('Is authenticated:', isAuthenticated);
    console.log('User:', user);
    
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to create an activity');
      router.push('/login');
      return;
    }
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting activity creation...');
    setIsLoading(true);
    try {
      // Calculate end_time from scheduled_time and duration
      const endTime = new Date(scheduledTime.getTime() + parseInt(duration) * 60000);
      
      const activityData: CreateActivityData = {
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategory!,
        location_name: locationName.trim(),
        address: address.trim(),
        latitude: 40.7128, // Mock location - would use actual location picker
        longitude: -74.0060,
        start_time: scheduledTime.toISOString(),
        end_time: endTime.toISOString(),
        max_participants: parseInt(maxParticipants),
        visibility: isPrivate ? 'private' : 'public',
      };

      console.log('Activity data:', activityData);
      const activity = await activitiesApi.createActivity(activityData);
      console.log('Activity created:', activity);
      Alert.alert('Success', 'Activity created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Failed to create activity:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.detail || error.message || 'Failed to create activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(scheduledTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduledTime(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledTime);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledTime(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="times" size={24} color={colorScheme === 'dark' ? '#ffffff' : '#1f2937'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
            Create Activity
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                  borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                }
              ]}
              placeholder="What are you planning?"
              placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                  borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                }
              ]}
              placeholder="Tell people more about this activity..."
              placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Category *
            </Text>
            <View style={styles.categoriesContainer}>
              {Array.isArray(categories) && categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: selectedCategory === category.id 
                        ? category.color 
                        : colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                      borderColor: selectedCategory === category.id 
                        ? category.color 
                        : colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <FontAwesome 
                    name={category.icon as any} 
                    size={14} 
                    color={selectedCategory === category.id ? '#ffffff' : category.color} 
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#ffffff' : colorScheme === 'dark' ? '#d1d5db' : '#4b5563' }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Location Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                  borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                }
              ]}
              placeholder="e.g., Central Park, Coffee Shop"
              placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
              value={locationName}
              onChangeText={setLocationName}
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Address *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                  borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                }
              ]}
              placeholder="Full address"
              placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
              value={address}
              onChangeText={setAddress}
              maxLength={200}
            />
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              Date & Time *
            </Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={16} color={Colors.light.tint} />
                <Text style={[styles.dateTimeText, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                  {formatDate(scheduledTime)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                  }
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <FontAwesome name="clock-o" size={16} color={Colors.light.tint} />
                <Text style={[styles.dateTimeText, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                  {formatTime(scheduledTime)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {/* Duration & Max Participants */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                Duration (min)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                    color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                  }
                ]}
                placeholder="60"
                placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                Max People
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                    color: colorScheme === 'dark' ? '#ffffff' : '#1f2937',
                    borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
                  }
                ]}
                placeholder="10"
                placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          {/* Private Toggle */}
          <TouchableOpacity
            style={[
              styles.toggleRow,
              { 
                backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#ffffff',
                borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
              }
            ]}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View style={styles.toggleInfo}>
              <FontAwesome 
                name={isPrivate ? 'lock' : 'globe'} 
                size={20} 
                color={Colors.light.tint} 
              />
              <View style={styles.toggleTextContainer}>
                <Text style={[styles.toggleTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#1f2937' }]}>
                  {isPrivate ? 'Private Activity' : 'Public Activity'}
                </Text>
                <Text style={[styles.toggleSubtitle, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                  {isPrivate ? 'Only invited friends can join' : 'Anyone nearby can discover and join'}
                </Text>
              </View>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: isPrivate ? Colors.light.tint : colorScheme === 'dark' ? '#374151' : '#d1d5db' }
            ]}>
              <View style={[
                styles.toggleKnob,
                { transform: [{ translateX: isPrivate ? 20 : 0 }] }
              ]} />
            </View>
          </TouchableOpacity>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={() => {
              console.log('Button pressed!');
              handleCreate();
            }}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <FontAwesome name="plus" size={18} color="#ffffff" />
                <Text style={styles.createButtonText}>Create Activity</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    marginBottom: 20,
    gap: 10,
    zIndex: 1,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
