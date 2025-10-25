/**
 * Spiritual Growth Hook
 * Manages spiritual growth tracking, goals, achievements, and progress analytics
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SpiritualGrowth,
  SpiritualActivity,
  SpiritualGoal,
  SpiritualStreak,
  Achievement,
  ProgressSnapshot
} from '@/types/dashboard';
import { spiritualMetricsCalculator, spiritualMetricsUtils } from '@/lib/spiritual-metrics';
import { storageUtils } from '@/lib/dashboard-utils';

/**
 * Spiritual growth configuration
 */
interface SpiritualGrowthConfig {
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  enableNotifications?: boolean;
  streakReminderThreshold?: number;
}

/**
 * Activity input interface
 */
interface ActivityInput {
  type: SpiritualActivity['type'];
  duration?: number;
  description: string;
  date?: Date;
}

/**
 * Goal input interface
 */
interface GoalInput {
  title: string;
  description: string;
  category: SpiritualGoal['category'];
  targetDate: Date;
  milestones?: Array<{
    title: string;
    description: string;
    targetValue: number;
  }>;
}

/**
 * Spiritual growth tracking hook
 */
export function useSpiritualGrowth(
  userId: string,
  config: SpiritualGrowthConfig = {}
) {
  const {
    enableAutoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    enableNotifications = true,
    streakReminderThreshold = 1 // days
  } = config;

  const queryClient = useQueryClient();

  // State
  const [spiritualGrowth, setSpiritualGrowth] = useState<SpiritualGrowth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  /**
   * Load spiritual growth data
   */
  const loadGrowthData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      const stored = storageUtils.loadDashboardData();
      const growthData = stored.spiritualGrowth;
      
      if (growthData && growthData.userId === userId) {
        setSpiritualGrowth(growthData);
      } else {
        // Initialize new spiritual growth data
        const initialGrowth: SpiritualGrowth = {
          userId,
          currentLevel: 0,
          totalPoints: 0,
          streaks: spiritualMetricsCalculator.calculateAllStreaks([]),
          goals: [],
          achievements: [],
          activities: [],
          progressHistory: []
        };
        setSpiritualGrowth(initialGrowth);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load spiritual growth data');
      console.error('Load growth data error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Save spiritual growth data
   */
  const saveGrowthData = useCallback(async (data: SpiritualGrowth) => {
    try {
      setIsSaving(true);
      
      // Save to local storage
      const currentDashboardData = storageUtils.loadDashboardData();
      storageUtils.saveDashboardData({
        ...currentDashboardData,
        spiritualGrowth: data
      });

      // Update query cache
      const dashboardData = queryClient.getQueryData(['dashboardData']) as any;
      if (dashboardData) {
        queryClient.setQueryData(['dashboardData'], {
          ...dashboardData,
          spiritualGrowth: data
        });
      }

      setLastSaved(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to save spiritual growth data');
      console.error('Save growth data error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [queryClient]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    loadGrowthData();
  }, [loadGrowthData]);

  /**
   * Auto-save when data changes
   */
  useEffect(() => {
    if (spiritualGrowth && enableAutoSave && !isLoading) {
      const saveTimer = setTimeout(() => {
        saveGrowthData(spiritualGrowth);
      }, autoSaveInterval);

      return () => clearTimeout(saveTimer);
    }
  }, [spiritualGrowth, enableAutoSave, autoSaveInterval, saveGrowthData, isLoading]);

  /**
   * Add spiritual activity
   */
  const addActivityMutation = useMutation({
    mutationFn: async (activityInput: ActivityInput) => {
      if (!spiritualGrowth) throw new Error('Spiritual growth data not loaded');

      const activity: SpiritualActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: activityInput.type,
        date: activityInput.date || new Date(),
        duration: activityInput.duration,
        description: activityInput.description,
        points: spiritualMetricsCalculator['ACTIVITY_POINTS'][activityInput.type],
        verified: true
      };

      const updatedActivities = [...spiritualGrowth.activities, activity];
      const totalPoints = spiritualMetricsCalculator.calculateTotalPoints(updatedActivities);
      const currentLevel = spiritualMetricsCalculator.calculateLevel(totalPoints);
      const streaks = spiritualMetricsCalculator.calculateAllStreaks(updatedActivities);
      
      // Check for new achievements
      const newAchievements = spiritualMetricsCalculator.checkForNewAchievements(
        updatedActivities,
        streaks,
        spiritualGrowth.achievements
      );

      const updatedGrowth: SpiritualGrowth = {
        ...spiritualGrowth,
        activities: updatedActivities,
        totalPoints,
        currentLevel,
        streaks,
        achievements: [...spiritualGrowth.achievements, ...newAchievements]
      };

      setSpiritualGrowth(updatedGrowth);
      await saveGrowthData(updatedGrowth);

      return { activity, newAchievements, levelUp: currentLevel > spiritualGrowth.currentLevel };
    },
    onError: (error) => {
      setError('Failed to add activity');
      console.error('Add activity error:', error);
    }
  });

  /**
   * Add spiritual goal
   */
  const addGoalMutation = useMutation({
    mutationFn: async (goalInput: GoalInput) => {
      if (!spiritualGrowth) throw new Error('Spiritual growth data not loaded');

      const goal: SpiritualGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: goalInput.title,
        description: goalInput.description,
        category: goalInput.category,
        targetDate: goalInput.targetDate,
        progress: 0,
        milestones: goalInput.milestones?.map((m, index) => ({
          id: `milestone_${Date.now()}_${index}`,
          title: m.title,
          description: m.description,
          targetValue: m.targetValue,
          currentValue: 0,
          completed: false
        })) || [],
        isActive: true
      };

      const updatedGrowth: SpiritualGrowth = {
        ...spiritualGrowth,
        goals: [...spiritualGrowth.goals, goal]
      };

      setSpiritualGrowth(updatedGrowth);
      await saveGrowthData(updatedGrowth);

      return goal;
    },
    onError: (error) => {
      setError('Failed to add goal');
      console.error('Add goal error:', error);
    }
  });

  /**
   * Update goal progress
   */
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<SpiritualGoal> }) => {
      if (!spiritualGrowth) throw new Error('Spiritual growth data not loaded');

      const updatedGoals = spiritualGrowth.goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, ...updates };
        }
        return goal;
      });

      const updatedGrowth: SpiritualGrowth = {
        ...spiritualGrowth,
        goals: updatedGoals
      };

      setSpiritualGrowth(updatedGrowth);
      await saveGrowthData(updatedGrowth);

      return updatedGoals.find(g => g.id === goalId);
    },
    onError: (error) => {
      setError('Failed to update goal');
      console.error('Update goal error:', error);
    }
  });

  /**
   * Create progress snapshot
   */
  const createProgressSnapshot = useCallback(() => {
    if (!spiritualGrowth) return;

    const snapshot = spiritualMetricsCalculator.createProgressSnapshot(
      spiritualGrowth.totalPoints,
      spiritualGrowth.activities,
      spiritualGrowth.goals
    );

    const updatedGrowth: SpiritualGrowth = {
      ...spiritualGrowth,
      progressHistory: [...spiritualGrowth.progressHistory, snapshot]
    };

    setSpiritualGrowth(updatedGrowth);
    saveGrowthData(updatedGrowth);
  }, [spiritualGrowth, saveGrowthData]);

  /**
   * Get growth insights
   */
  const growthInsights = useMemo(() => {
    if (!spiritualGrowth) return [];
    return spiritualMetricsCalculator.getGrowthInsights(spiritualGrowth);
  }, [spiritualGrowth]);

  /**
   * Get recommended actions
   */
  const recommendedActions = useMemo(() => {
    if (!spiritualGrowth) return [];
    return spiritualMetricsCalculator.getRecommendedActions(spiritualGrowth);
  }, [spiritualGrowth]);

  /**
   * Get level progress percentage
   */
  const levelProgress = useMemo(() => {
    if (!spiritualGrowth) return 0;
    return spiritualMetricsCalculator.getLevelProgress(spiritualGrowth.totalPoints);
  }, [spiritualGrowth]);

  /**
   * Get points to next level
   */
  const pointsToNextLevel = useMemo(() => {
    if (!spiritualGrowth) return 0;
    return spiritualMetricsCalculator.getPointsToNextLevel(spiritualGrowth.totalPoints);
  }, [spiritualGrowth]);

  /**
   * Get current level title
   */
  const levelTitle = useMemo(() => {
    if (!spiritualGrowth) return 'Seeker';
    return spiritualMetricsUtils.getLevelTitle(spiritualGrowth.currentLevel);
  }, [spiritualGrowth]);

  /**
   * Get activity summary for a time period
   */
  const getActivitySummary = useCallback((days: number = 7) => {
    if (!spiritualGrowth) return null;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentActivities = spiritualGrowth.activities.filter(
      activity => activity.date >= cutoffDate
    );

    const summary = {
      totalActivities: recentActivities.length,
      totalPoints: recentActivities.reduce((sum, activity) => sum + activity.points, 0),
      byType: recentActivities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      dailyAverage: recentActivities.length / days
    };

    return summary;
  }, [spiritualGrowth]);

  /**
   * Get streak status with warnings
   */
  const getStreakStatus = useCallback(() => {
    if (!spiritualGrowth) return [];

    return spiritualGrowth.streaks.map(streak => {
      // Ensure lastActivity is a Date object
      const lastActivity = streak.lastActivity instanceof Date 
        ? streak.lastActivity 
        : new Date(streak.lastActivity);
      
      // Check if date is valid
      let daysSinceLastActivity = 0;
      if (!isNaN(lastActivity.getTime())) {
        daysSinceLastActivity = Math.floor(
          (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );
      } else {
        console.warn('Invalid lastActivity date for streak:', streak);
        // Default to a reasonable value if date is invalid
        daysSinceLastActivity = 1;
      }

      return {
        ...streak,
        lastActivity, // Use the converted date
        daysSinceLastActivity,
        isAtRisk: daysSinceLastActivity >= streakReminderThreshold && streak.currentStreak > 0,
        isBroken: streak.currentStreak === 0,
        emoji: spiritualMetricsUtils.getStreakEmoji(streak.currentStreak)
      };
    });
  }, [spiritualGrowth, streakReminderThreshold]);

  /**
   * Get active goals with progress
   */
  const getActiveGoals = useCallback(() => {
    if (!spiritualGrowth) return [];

    return spiritualGrowth.goals
      .filter(goal => goal.isActive)
      .map(goal => {
        const daysRemaining = Math.ceil(
          (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...goal,
          daysRemaining,
          isOverdue: daysRemaining < 0,
          isUrgent: daysRemaining <= 7 && daysRemaining > 0,
          progressStatus: goal.progress >= 100 ? 'complete' : 
                         goal.progress >= 75 ? 'almost-done' :
                         goal.progress >= 50 ? 'on-track' :
                         goal.progress >= 25 ? 'behind' : 'needs-attention'
        };
      });
  }, [spiritualGrowth]);

  /**
   * Get recent achievements
   */
  const getRecentAchievements = useCallback((days: number = 30) => {
    if (!spiritualGrowth) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return spiritualGrowth.achievements
      .filter(achievement => achievement.earnedDate >= cutoffDate)
      .sort((a, b) => b.earnedDate.getTime() - a.earnedDate.getTime());
  }, [spiritualGrowth]);

  /**
   * Export spiritual growth data
   */
  const exportGrowthData = useCallback(() => {
    if (!spiritualGrowth) return null;

    return {
      ...spiritualGrowth,
      insights: growthInsights,
      recommendedActions,
      levelProgress,
      pointsToNextLevel,
      levelTitle,
      activitySummary: getActivitySummary(30),
      streakStatus: getStreakStatus(),
      activeGoals: getActiveGoals(),
      recentAchievements: getRecentAchievements()
    };
  }, [
    spiritualGrowth,
    growthInsights,
    recommendedActions,
    levelProgress,
    pointsToNextLevel,
    levelTitle,
    getActivitySummary,
    getStreakStatus,
    getActiveGoals,
    getRecentAchievements
  ]);

  return {
    // State
    spiritualGrowth,
    isLoading,
    isSaving,
    error,
    lastSaved,

    // Actions
    addActivity: addActivityMutation.mutateAsync,
    addGoal: addGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    createProgressSnapshot,
    refreshData: loadGrowthData,

    // Computed values
    growthInsights,
    recommendedActions,
    levelProgress,
    pointsToNextLevel,
    levelTitle,

    // Getters
    getActivitySummary,
    getStreakStatus,
    getActiveGoals,
    getRecentAchievements,
    exportGrowthData,

    // Mutation states
    isAddingActivity: addActivityMutation.isPending,
    isAddingGoal: addGoalMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending
  };
}