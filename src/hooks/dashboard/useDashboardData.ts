/**
 * Dashboard Data Management Hook
 * Main hook for managing dashboard state, data fetching, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DashboardData,
  DashboardState,
  UserProfile,
  ContentItem,
  CalendarEvent,
  SpiritualGrowth,
  CommunityConnection,
  AIRecommendation
} from '@/types/dashboard';
import { storageUtils, mockDataUtils, contentUtils } from '@/lib/dashboard-utils';
import { aiRecommendationEngine } from '@/lib/ai-recommendations';
import { spiritualMetricsCalculator } from '@/lib/spiritual-metrics';
import { usePersonalization } from './usePersonalization';

/**
 * Dashboard configuration options
 */
interface DashboardConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableOfflineMode?: boolean;
  mockData?: boolean;
}

/**
 * Main dashboard data hook
 */
export function useDashboardData(config: DashboardConfig = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enableOfflineMode = true,
    mockData = true // Set to true for demo purposes
  } = config;

  const queryClient = useQueryClient();
  const { personalizationMetrics, updateEngagement } = usePersonalization();

  // Main dashboard state
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    user: null,
    contentFeed: [],
    upcomingEvents: [],
    spiritualGrowth: null,
    communityConnections: [],
    recommendations: [],
    isLoading: true,
    error: null,
    lastUpdated: new Date()
  });

  /**
   * Fetch dashboard data - uses mock data for demo
   */
  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    // In a real application, this would make API calls
    // For demo purposes, we'll use mock data and local storage
    
    try {
      let data: Partial<DashboardData> = {};

      if (mockData) {
        // Generate mock data for demonstration
        data = {
          user: mockDataUtils.generateMockUser(),
          contentFeed: mockDataUtils.generateMockContent(15),
          upcomingEvents: mockDataUtils.generateMockEvents(8),
          spiritualGrowth: generateMockSpiritualGrowth(),
          communityConnections: generateMockCommunityConnections(),
          recommendations: []
        };

        // Save to local storage for persistence
        storageUtils.saveDashboardData(data);
      } else {
        // Load from local storage or API
        data = storageUtils.loadDashboardData();
        
        // Ensure all dates are properly converted to Date objects
        if (data.spiritualGrowth?.streaks) {
          data.spiritualGrowth.streaks = data.spiritualGrowth.streaks.map(streak => ({
            ...streak,
            lastActivity: streak.lastActivity instanceof Date 
              ? streak.lastActivity 
              : new Date(streak.lastActivity)
          }));
        }
        
        if (data.upcomingEvents) {
          data.upcomingEvents = data.upcomingEvents.map(event => ({
            ...event,
            startDate: event.startDate instanceof Date 
              ? event.startDate 
              : new Date(event.startDate),
            endDate: event.endDate instanceof Date 
              ? event.endDate 
              : new Date(event.endDate)
          }));
        }
        
        if (data.contentFeed) {
          data.contentFeed = data.contentFeed.map(content => ({
            ...content,
            publishDate: content.publishDate instanceof Date 
              ? content.publishDate 
              : new Date(content.publishDate)
          }));
        }
      }

      // Generate AI recommendations if we have user data
      if (data.user && personalizationMetrics) {
        const contentRecommendations = aiRecommendationEngine.generateContentRecommendations(
          data.user,
          data.contentFeed || [],
          personalizationMetrics,
          5
        );

        const growthRecommendations = data.spiritualGrowth 
          ? aiRecommendationEngine.generateSpiritualGrowthRecommendations(data.user, data.spiritualGrowth)
          : [];

        const communityRecommendations = aiRecommendationEngine.generateCommunityRecommendations(
          data.user,
          data.communityConnections || [],
          personalizationMetrics
        );

        data.recommendations = [
          ...contentRecommendations,
          ...growthRecommendations,
          ...communityRecommendations
        ];
      }

      return data as DashboardData;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }, [mockData, personalizationMetrics]);

  /**
   * React Query for dashboard data
   */
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  /**
   * Update dashboard state when data changes
   */
  useEffect(() => {
    if (data) {
      setDashboardState(prev => ({
        ...prev,
        user: data.user,
        contentFeed: data.contentFeed,
        upcomingEvents: data.upcomingEvents,
        spiritualGrowth: data.spiritualGrowth,
        communityConnections: data.communityConnections,
        recommendations: data.recommendations,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      }));
    }
  }, [data]);

  /**
   * Handle loading and error states
   */
  useEffect(() => {
    setDashboardState(prev => ({
      ...prev,
      isLoading,
      error: error?.message || null
    }));
  }, [isLoading, error]);

  /**
   * Content engagement mutation
   */
  const engageWithContentMutation = useMutation({
    mutationFn: async ({ contentId, engagementType }: { 
      contentId: string; 
      engagementType: 'view' | 'like' | 'share' | 'comment' 
    }) => {
      // Update local data
      const currentData = queryClient.getQueryData<DashboardData>(['dashboardData']);
      if (currentData) {
        const updatedContent = currentData.contentFeed.map(item => {
          if (item.id === contentId) {
            const updatedEngagement = { ...item.engagement };
            updatedEngagement[engagementType === 'view' ? 'views' : 
                              engagementType === 'like' ? 'likes' :
                              engagementType === 'share' ? 'shares' : 'comments']++;
            updatedEngagement.userEngaged = true;
            updatedEngagement.engagementType = engagementType;
            
            return { ...item, engagement: updatedEngagement };
          }
          return item;
        });

        const updatedData = { ...currentData, contentFeed: updatedContent };
        queryClient.setQueryData(['dashboardData'], updatedData);
        storageUtils.saveDashboardData(updatedData);
      }

      // Update personalization metrics
      const content = currentData?.contentFeed.find(item => item.id === contentId);
      if (content) {
        updateEngagement(content.type, engagementType);
      }

      return { success: true };
    },
    onError: (error) => {
      console.error('Failed to update engagement:', error);
    }
  });

  /**
   * Update spiritual activity mutation
   */
  const updateSpiritualActivityMutation = useMutation({
    mutationFn: async (activity: Omit<import('@/types/dashboard').SpiritualActivity, 'id' | 'verified'>) => {
      const currentData = queryClient.getQueryData<DashboardData>(['dashboardData']);
      if (currentData?.spiritualGrowth) {
        const newActivity = {
          ...activity,
          id: `activity_${Date.now()}`,
          verified: true
        };

        const updatedActivities = [...currentData.spiritualGrowth.activities, newActivity];
        const updatedPoints = spiritualMetricsCalculator.calculateTotalPoints(updatedActivities);
        const updatedLevel = spiritualMetricsCalculator.calculateLevel(updatedPoints);
        const updatedStreaks = spiritualMetricsCalculator.calculateAllStreaks(updatedActivities);

        const updatedGrowth = {
          ...currentData.spiritualGrowth,
          activities: updatedActivities,
          totalPoints: updatedPoints,
          currentLevel: updatedLevel,
          streaks: updatedStreaks
        };

        const updatedData = { ...currentData, spiritualGrowth: updatedGrowth };
        queryClient.setQueryData(['dashboardData'], updatedData);
        storageUtils.saveDashboardData(updatedData);
      }

      return { success: true };
    }
  });

  /**
   * Update user preferences mutation
   */
  const updateUserPreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<UserProfile['preferences']>) => {
      const currentData = queryClient.getQueryData<DashboardData>(['dashboardData']);
      if (currentData?.user) {
        const updatedUser = {
          ...currentData.user,
          preferences: { ...currentData.user.preferences, ...preferences }
        };

        const updatedData = { ...currentData, user: updatedUser };
        queryClient.setQueryData(['dashboardData'], updatedData);
        storageUtils.saveDashboardData(updatedData);
        storageUtils.saveUserPreferences(updatedUser.preferences);
      }

      return { success: true };
    }
  });

  /**
   * Manual refresh function
   */
  const refreshDashboard = useCallback(() => {
    return refetch();
  }, [refetch]);

  /**
   * Engage with content
   */
  const engageWithContent = useCallback((
    contentId: string, 
    engagementType: 'view' | 'like' | 'share' | 'comment'
  ) => {
    return engageWithContentMutation.mutateAsync({ contentId, engagementType });
  }, [engageWithContentMutation]);

  /**
   * Add spiritual activity
   */
  const addSpiritualActivity = useCallback((
    activity: Omit<import('@/types/dashboard').SpiritualActivity, 'id' | 'verified'>
  ) => {
    return updateSpiritualActivityMutation.mutateAsync(activity);
  }, [updateSpiritualActivityMutation]);

  /**
   * Update user preferences
   */
  const updateUserPreferences = useCallback((
    preferences: Partial<UserProfile['preferences']>
  ) => {
    return updateUserPreferencesMutation.mutateAsync(preferences);
  }, [updateUserPreferencesMutation]);

  /**
   * Get filtered and sorted content
   */
  const getFilteredContent = useCallback((
    filters?: import('@/types/dashboard').FilterOptions,
    sortOptions?: import('@/types/dashboard').SortOptions
  ) => {
    let content: ContentItem[] = dashboardState.contentFeed;

    if (filters) {
      content = contentUtils.filterContent(content, filters);
    }

    if (sortOptions) {
      content = contentUtils.sortContent(content, sortOptions);
    }

    return content;
  }, [dashboardState.contentFeed]);

  return {
    // State
    ...dashboardState,
    
    // Actions
    refreshDashboard,
    engageWithContent,
    addSpiritualActivity,
    updateUserPreferences,
    getFilteredContent,
    
    // Query status
    isRefetching: isLoading,
    
    // Utilities
    lastUpdated: dashboardState.lastUpdated
  };
}

/**
 * Generate mock spiritual growth data
 */
function generateMockSpiritualGrowth(): SpiritualGrowth {
  const activities = Array.from({ length: 30 }, (_, i) => {
    const types: Array<import('@/types/dashboard').SpiritualActivity['type']> = 
      ['prayer', 'reading', 'service', 'attendance', 'donation', 'ministry'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: `activity_${i + 1}`,
      type,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
      duration: type === 'prayer' || type === 'reading' ? Math.floor(Math.random() * 60) + 10 : undefined,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} activity`,
      points: spiritualMetricsCalculator['ACTIVITY_POINTS'][type],
      verified: true
    };
  });

  const totalPoints = spiritualMetricsCalculator.calculateTotalPoints(activities);
  const currentLevel = spiritualMetricsCalculator.calculateLevel(totalPoints);
  const streaks = spiritualMetricsCalculator.calculateAllStreaks(activities);

  return {
    userId: 'user_123',
    currentLevel,
    totalPoints,
    streaks,
    goals: [
      {
        id: 'goal_1',
        title: 'Daily Prayer Commitment',
        description: 'Pray for at least 15 minutes every day',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'prayer',
        progress: 65,
        milestones: [
          {
            id: 'milestone_1',
            title: 'First Week',
            description: 'Complete 7 days of prayer',
            targetValue: 7,
            currentValue: 7,
            completed: true,
            completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          }
        ],
        isActive: true
      }
    ],
    achievements: [
      {
        id: 'first_prayer',
        title: 'First Prayer',
        description: 'Logged your first prayer session',
        badgeIcon: '🙏',
        earnedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        category: 'prayer',
        points: 50
      }
    ],
    activities,
    progressHistory: []
  };
}

/**
 * Generate mock community connections
 */
function generateMockCommunityConnections(): CommunityConnection[] {
  return [
    {
      id: 'group_1',
      type: 'small_group',
      title: 'Young Adults Bible Study',
      description: 'Weekly Bible study for young adults aged 18-35',
      memberCount: 12,
      matchScore: 85,
      tags: ['bible study', 'young adults', 'fellowship'],
      leader: 'Sarah Johnson',
      meetingSchedule: 'Thursdays at 7:00 PM',
      location: 'Church Fellowship Hall',
      isJoined: false,
      recommendationReason: 'Matches your interest in Bible study and age group'
    },
    {
      id: 'ministry_1',
      type: 'ministry',
      title: 'Community Outreach Ministry',
      description: 'Serving the local community through various outreach programs',
      memberCount: 25,
      matchScore: 78,
      tags: ['service', 'community', 'outreach'],
      leader: 'Pastor Michael',
      meetingSchedule: 'Saturdays at 9:00 AM',
      location: 'Various Community Locations',
      isJoined: false,
      recommendationReason: 'Aligns with your passion for community service'
    },
    {
      id: 'volunteer_1',
      type: 'volunteer',
      title: 'Food Bank Volunteers',
      description: 'Help distribute food to families in need',
      memberCount: 18,
      matchScore: 72,
      tags: ['volunteer', 'food bank', 'service'],
      leader: 'Maria Rodriguez',
      meetingSchedule: 'Second Saturday of each month',
      location: 'St. Anthony Food Bank',
      isJoined: false,
      recommendationReason: 'Perfect for your interest in community service'
    }
  ];
}