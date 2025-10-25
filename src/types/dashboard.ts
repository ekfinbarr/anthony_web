/**
 * Dashboard TypeScript Type Definitions
 * Defines all types and interfaces used in the personalized member dashboard
 */

// User Profile and Preferences
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  preferences: UserPreferences;
  interests: string[];
  ministries: string[];
}

export interface UserPreferences {
  contentTypes: ContentType[];
  notificationSettings: NotificationSettings;
  calendarSettings: CalendarSettings;
  privacySettings: PrivacySettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderSettings: {
    events: boolean;
    prayers: boolean;
    reading: boolean;
  };
}

export interface CalendarSettings {
  defaultView: 'week' | 'month' | 'agenda';
  timeZone: string;
  syncExternalCalendars: boolean;
}

export interface PrivacySettings {
  showActivityStatus: boolean;
  shareGrowthProgress: boolean;
  allowRecommendations: boolean;
}

// Content Management
export type ContentType = 'sermon' | 'event' | 'news' | 'ministry' | 'devotional' | 'prayer';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  author: string;
  publishDate: Date;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  tags: string[];
  category: string;
  engagement: EngagementMetrics;
  personalizedScore?: number;
}

export interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  userEngaged: boolean;
  engagementType?: 'view' | 'like' | 'share' | 'comment';
}

// Calendar and Events
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: EventType;
  organizer: string;
  attendees?: string[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  reminderSettings: ReminderSettings;
  conflictLevel?: 'none' | 'low' | 'medium' | 'high';
  rsvpStatus?: 'pending' | 'accepted' | 'declined' | 'maybe';
}

export type EventType = 'mass' | 'meeting' | 'social' | 'service' | 'ministry' | 'personal';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[];
}

export interface ReminderSettings {
  enabled: boolean;
  reminderTimes: number[]; // minutes before event
}

export interface CalendarConflict {
  eventId: string;
  conflictingEvents: CalendarEvent[];
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

// Spiritual Growth Tracking
export interface SpiritualGrowth {
  userId: string;
  currentLevel: number;
  totalPoints: number;
  streaks: SpiritualStreak[];
  goals: SpiritualGoal[];
  achievements: Achievement[];
  activities: SpiritualActivity[];
  progressHistory: ProgressSnapshot[];
}

export interface SpiritualStreak {
  type: 'prayer' | 'reading' | 'service' | 'attendance';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
}

export interface SpiritualGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  category: 'prayer' | 'reading' | 'service' | 'ministry' | 'knowledge';
  progress: number; // percentage 0-100
  milestones: Milestone[];
  isActive: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  completedDate?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  earnedDate: Date;
  category: string;
  points: number;
}

export interface SpiritualActivity {
  id: string;
  type: 'prayer' | 'reading' | 'service' | 'attendance' | 'donation' | 'ministry';
  date: Date;
  duration?: number; // minutes
  description: string;
  points: number;
  verified: boolean;
}

export interface ProgressSnapshot {
  date: Date;
  totalPoints: number;
  level: number;
  activitiesCount: number;
  goalsProgress: Record<string, number>;
}

// Community Connections
export interface CommunityConnection {
  id: string;
  type: 'small_group' | 'ministry' | 'volunteer' | 'social' | 'mentorship';
  title: string;
  description: string;
  memberCount: number;
  matchScore: number; // 0-100
  tags: string[];
  leader: string;
  meetingSchedule: string;
  location: string;
  imageUrl?: string;
  isJoined: boolean;
  recommendationReason: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  skills: string[];
  timeCommitment: string;
  startDate: Date;
  endDate?: Date;
  organizer: string;
  urgency: 'low' | 'medium' | 'high';
  matchScore: number;
  spotsAvailable: number;
  isApplied: boolean;
}

// AI Recommendations
export interface AIRecommendation {
  id: string;
  type: 'content' | 'event' | 'connection' | 'goal' | 'activity';
  title: string;
  description: string;
  confidence: number; // 0-100
  reason: string;
  data: any; // flexible data structure for different recommendation types
  expiresAt?: Date;
  isActioned: boolean;
}

export interface PersonalizationMetrics {
  contentEngagement: Record<ContentType, number>;
  activityFrequency: Record<string, number>;
  timePreferences: {
    preferredDays: number[];
    preferredTimes: string[];
  };
  socialPreferences: {
    groupSize: 'small' | 'medium' | 'large';
    participationLevel: 'observer' | 'participant' | 'leader';
  };
}

// Dashboard State
export interface DashboardState {
  user: UserProfile | null;
  contentFeed: ContentItem[];
  upcomingEvents: CalendarEvent[];
  spiritualGrowth: SpiritualGrowth | null;
  communityConnections: CommunityConnection[];
  recommendations: AIRecommendation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// API Response Types
export interface DashboardData {
  user: UserProfile;
  contentFeed: ContentItem[];
  upcomingEvents: CalendarEvent[];
  spiritualGrowth: SpiritualGrowth;
  communityConnections: CommunityConnection[];
  recommendations: AIRecommendation[];
}

// Utility Types
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  contentTypes?: ContentType[];
  eventTypes?: EventType[];
  dateRange?: TimeRange;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}